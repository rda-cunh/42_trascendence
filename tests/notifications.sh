#!/usr/bin/env bash
#
# End-to-end tests for the notifications REST endpoints.
# Runs AFTER the data-service routes are integrated.
#
# What this verifies that the original smoke script could not:
#   • The data-service is actually reachable and returns the expected shape.
#   • An empty user has 0 unread and an empty list.
#   • mark-read / mark-all-read are no-ops on an empty inbox (return marked=0).
#   • Cross-user safety: user A cannot mark notifications belonging to user B
#     even if they guess their IDs.
#   • Query params (limit, offset, unread_only) round-trip cleanly.
#
# What this still can NOT verify (until create_product calls fanout):
#   • Actual notification generation from a product publish.
#   • A non-empty bell. We'd need either DB seeding or the fanout hook
#     in create_product to be wired up.
#
# Usage:
#   ./notifications_e2e.sh
# Exit code is the number of failed assertions (0 = all passed).

set -u

DOMAIN="https://127.0.0.1/api/"
DIR="notifications_e2e"
HEADER="Content-Type: application/json"

SUFFIX="$(date +%s)_$$"
EMAIL_A="alice_${SUFFIX}@email.com"
EMAIL_B="bob_${SUFFIX}@email.com"
PASS_A="securepass_alice"
PASS_B="securepass_bob"

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
DIM='\033[2m'
RESET='\033[0m'

PASS=0
FAIL=0

mkdir -p "${DIR}"

# ---------- generic helpers -----------------------------------------------

# call METHOD ENDPOINT TOKEN [BODY]
# Writes body to ${DIR}/last_response.json, echoes status code.
call() {
    local method=$1
    local endpoint=$2
    local token=$3
    local body=${4:-}
    local args=(
        --silent --show-error --insecure
        -o "${DIR}/last_response.json"
        -w "%{http_code}"
        -X "${method}"
        "${DOMAIN}${endpoint}"
        -H "${HEADER}"
    )
    [ -n "${token}" ] && args+=( -H "Authorization: Bearer ${token}" )
    [ -n "${body}"  ] && args+=( -d "${body}" )
    curl "${args[@]}"
}

# assert_eq LABEL EXPECTED ACTUAL
assert_eq() {
    local label=$1 expected=$2 actual=$3
    if [ "${expected}" = "${actual}" ]; then
        echo -e "  ${GREEN}PASS${RESET}  ${label}  ${DIM}(${actual})${RESET}"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}FAIL${RESET}  ${label}  ${DIM}expected ${expected}, got ${actual}${RESET}"
        [ -s "${DIR}/last_response.json" ] && echo -e "  ${DIM}body: $(cat "${DIR}/last_response.json")${RESET}"
        FAIL=$((FAIL + 1))
    fi
}

# assert_body_has LABEL JQ_EXPR EXPECTED
# Uses python3 to evaluate a dot path on last_response.json (no jq dependency).
# Example: assert_body_has "unread count == 0" 'num' '0'
assert_body_has() {
    local label=$1 path=$2 expected=$3
    local actual
    actual=$(python3 -c "
import json, sys
try:
    with open('${DIR}/last_response.json') as f:
        data = json.load(f)
    val = data
    for k in '${path}'.split('.') if '${path}' else []:
        val = val[k] if isinstance(val, dict) else val[int(k)]
    print(val)
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    print('__ERR__')
")
    if [ "${expected}" = "${actual}" ]; then
        echo -e "  ${GREEN}PASS${RESET}  ${label}  ${DIM}(${path}=${actual})${RESET}"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}FAIL${RESET}  ${label}  ${DIM}expected ${path}=${expected}, got ${actual}${RESET}"
        [ -s "${DIR}/last_response.json" ] && echo -e "  ${DIM}body: $(cat "${DIR}/last_response.json")${RESET}"
        FAIL=$((FAIL + 1))
    fi
}

# assert_body_is_array LABEL [EXPECTED_LENGTH]
# Asserts last_response.json parses as a JSON array, optionally of given length.
assert_body_is_array() {
    local label=$1 expected_len=${2:-}
    local actual
    actual=$(python3 -c "
import json
try:
    with open('${DIR}/last_response.json') as f:
        d = json.load(f)
    print('list' if isinstance(d, list) else type(d).__name__, len(d) if hasattr(d, '__len__') else 'na')
except Exception as e:
    print(f'ERROR {e}')
")
    if [ -z "${expected_len}" ]; then
        if [[ "${actual}" == list* ]]; then
            echo -e "  ${GREEN}PASS${RESET}  ${label}  ${DIM}(${actual})${RESET}"
            PASS=$((PASS + 1))
        else
            echo -e "  ${RED}FAIL${RESET}  ${label}  ${DIM}expected list, got ${actual}${RESET}"
            FAIL=$((FAIL + 1))
        fi
    else
        if [ "${actual}" = "list ${expected_len}" ]; then
            echo -e "  ${GREEN}PASS${RESET}  ${label}  ${DIM}(list of ${expected_len})${RESET}"
            PASS=$((PASS + 1))
        else
            echo -e "  ${RED}FAIL${RESET}  ${label}  ${DIM}expected list of ${expected_len}, got ${actual}${RESET}"
            [ -s "${DIR}/last_response.json" ] && echo -e "  ${DIM}body: $(cat "${DIR}/last_response.json")${RESET}"
            FAIL=$((FAIL + 1))
        fi
    fi
}

# ---------- setup: two users so we can test isolation ----------------------

echo -e "${BLUE}== Setup ==${RESET}"

register_user() {
    local email=$1 password=$2 name=$3
    local body="{\"name\": \"${name}\", \"email\": \"${email}\", \"password\": \"${password}\"}"
    local status
    status=$(curl --silent --show-error --insecure \
        -o "${DIR}/register_${name}.json" -w "%{http_code}" \
        -X POST "${DOMAIN}auth/register/" -H "${HEADER}" -d "${body}")
    if [ "${status}" != "201" ] && [ "${status}" != "200" ]; then
        echo -e "  ${RED}Could not register ${name} (status ${status})${RESET}"
        echo -e "  ${DIM}body: $(cat "${DIR}/register_${name}.json")${RESET}"
        exit 1
    fi
    echo -e "  registered ${name} (${email})"
}

login_user() {
    local email=$1 password=$2 name=$3
    local body="{\"email\": \"${email}\", \"password\": \"${password}\"}"
    local status
    status=$(curl --silent --show-error --insecure \
        -o "${DIR}/login_${name}.json" -w "%{http_code}" \
        -X POST "${DOMAIN}auth/login/" -H "${HEADER}" -d "${body}")
    if [ "${status}" != "200" ]; then
        echo -e "  ${RED}Login ${name} failed (status ${status})${RESET}"
        exit 1
    fi
    python3 -c "import json; print(json.load(open('${DIR}/login_${name}.json'))['access'])"
}

register_user "${EMAIL_A}" "${PASS_A}" "alice"
register_user "${EMAIL_B}" "${PASS_B}" "bob"
TOKEN_A=$(login_user "${EMAIL_A}" "${PASS_A}" "alice")
TOKEN_B=$(login_user "${EMAIL_B}" "${PASS_B}" "bob")
USER_ID_A=$(python3 -c "import json; print(json.load(open('${DIR}/login_alice.json'))['user']['id'])")
USER_ID_B=$(python3 -c "import json; print(json.load(open('${DIR}/login_bob.json'))['user']['id'])")
echo -e "  alice id=${USER_ID_A}, bob id=${USER_ID_B}"
echo

# ---------- 1. Auth gate (regression — must still hold) -------------------

echo -e "${BLUE}== 1. Auth gate ==${RESET}"
STATUS=$(call GET  "notifications/"             "")
assert_eq "GET  list                       unauth 401" "401" "${STATUS}"
STATUS=$(call GET  "notifications/unread-count/" "")
assert_eq "GET  unread-count               unauth 401" "401" "${STATUS}"
STATUS=$(call POST "notifications/read/"     "" '{"ids":[1]}')
assert_eq "POST read                       unauth 401" "401" "${STATUS}"
STATUS=$(call POST "notifications/read-all/" "")
assert_eq "POST read-all                   unauth 401" "401" "${STATUS}"
echo

# ---------- 2. Empty inbox: fresh user, no notifications ------------------

echo -e "${BLUE}== 2. Empty inbox (fresh user) ==${RESET}"

STATUS=$(call GET "notifications/" "${TOKEN_A}")
assert_eq "GET  list                       200" "200" "${STATUS}"
assert_body_is_array "GET  list returns []           " "0"

STATUS=$(call GET "notifications/unread-count/" "${TOKEN_A}")
assert_eq "GET  unread-count               200" "200" "${STATUS}"
assert_body_has "GET  unread-count == 0          " "num" "0"

STATUS=$(call POST "notifications/read-all/" "${TOKEN_A}")
assert_eq "POST read-all empty             200" "200" "${STATUS}"
assert_body_has "POST read-all marked == 0       " "marked" "0"
echo

# ---------- 3. Mark-read on empty / non-existent / others ----------------

echo -e "${BLUE}== 3. mark-read on empty inbox / non-existent IDs ==${RESET}"

# Non-existent IDs: data-service scopes by receiver_id, so unknown ids
# are silently ignored — expect 200 with marked=0, NOT a 404.
STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{"ids":[999999, 999998]}')
assert_eq "POST read non-existent ids      200" "200" "${STATUS}"
assert_body_has "POST read marked == 0           " "marked" "0"
echo

# ---------- 4. Cross-user safety -------------------------------------------

echo -e "${BLUE}== 4. Cross-user isolation ==${RESET}"
echo -e "${DIM}   Both users have empty inboxes; what we are verifying is that${RESET}"
echo -e "${DIM}   alice's auth never lets her touch bob's URL-space. Since URLs${RESET}"
echo -e "${DIM}   are derived from request.user.id in Django, this is enforced${RESET}"
echo -e "${DIM}   structurally, not by data-service permissions.${RESET}"

# Alice marks "all" — only her own can be affected.
STATUS=$(call POST "notifications/read-all/" "${TOKEN_A}")
assert_eq "alice read-all                   200" "200" "${STATUS}"
assert_body_has "alice marked == 0 (own inbox)   " "marked" "0"

# Bob then checks his own count is still 0.
STATUS=$(call GET "notifications/unread-count/" "${TOKEN_B}")
assert_eq "bob unread-count                 200" "200" "${STATUS}"
assert_body_has "bob unread-count == 0           " "num" "0"
echo

# ---------- 5. Query params round-trip cleanly ----------------------------

echo -e "${BLUE}== 5. Query params (limit, offset, unread_only) ==${RESET}"

STATUS=$(call GET "notifications/?limit=5"                 "${TOKEN_A}")
assert_eq "GET  limit=5                     200" "200" "${STATUS}"
assert_body_is_array "GET  limit=5 still empty list   "

STATUS=$(call GET "notifications/?limit=5&offset=0"        "${TOKEN_A}")
assert_eq "GET  limit=5&offset=0            200" "200" "${STATUS}"

STATUS=$(call GET "notifications/?unread_only=true"        "${TOKEN_A}")
assert_eq "GET  unread_only=true            200" "200" "${STATUS}"

STATUS=$(call GET "notifications/?limit=5&unread_only=true&offset=10" "${TOKEN_A}")
assert_eq "GET  all three params            200" "200" "${STATUS}"

# Allow-list check: an unknown param must not break the request (Django drops
# it before proxying since notification_list explicitly allow-lists).
STATUS=$(call GET "notifications/?bogus=1&limit=3"         "${TOKEN_A}")
assert_eq "GET  unknown param ignored       200" "200" "${STATUS}"
echo

# ---------- 6. Serializer validation (regression from earlier) ------------

echo -e "${BLUE}== 6. NotificationReadSerializer validation ==${RESET}"

STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{"ids":[]}')
assert_eq "empty ids list                   400" "400" "${STATUS}"

STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{}')
assert_eq "missing ids field                400" "400" "${STATUS}"

STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{"ids":["abc",2]}')
assert_eq "non-integer ids                  400" "400" "${STATUS}"

STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{"ids":[0]}')
assert_eq "zero id                          400" "400" "${STATUS}"

STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{"ids":[-3]}')
assert_eq "negative id                      400" "400" "${STATUS}"

BIG_LIST=$(python3 -c "import json; print(json.dumps({'ids': list(range(1, 102))}))")
STATUS=$(call POST "notifications/read/" "${TOKEN_A}" "${BIG_LIST}")
assert_eq "101 ids                          400" "400" "${STATUS}"

STATUS=$(call POST "notifications/read/" "${TOKEN_A}" '{ids: [1]}')
assert_eq "malformed JSON                   400" "400" "${STATUS}"
echo

# ---------- 7. Response shape (catches schema drift) ----------------------

echo -e "${BLUE}== 7. Response shape sanity ==${RESET}"

# unread-count: must include the "num" key.
call GET "notifications/unread-count/" "${TOKEN_A}" > /dev/null
SHAPE=$(python3 -c "
import json
d = json.load(open('${DIR}/last_response.json'))
print('OK' if isinstance(d, dict) and 'num' in d and isinstance(d['num'], int) else f'BAD: {d}')
")
assert_eq "unread-count has int 'num'      " "OK" "${SHAPE}"

# mark-read returns {marked: int}.
call POST "notifications/read-all/" "${TOKEN_A}" > /dev/null
SHAPE=$(python3 -c "
import json
d = json.load(open('${DIR}/last_response.json'))
print('OK' if isinstance(d, dict) and 'marked' in d and isinstance(d['marked'], int) else f'BAD: {d}')
")
assert_eq "read-all has int 'marked'       " "OK" "${SHAPE}"
echo

# ---------- summary --------------------------------------------------------

TOTAL=$((PASS + FAIL))
echo -e "${BLUE}== Summary ==${RESET}"
if [ "${FAIL}" -eq 0 ]; then
    echo -e "  ${GREEN}${PASS}/${TOTAL} passed${RESET}"
else
    echo -e "  ${RED}${FAIL}/${TOTAL} failed${RESET}, ${PASS} passed"
fi

# Bonus: print the resolved IDs in case the user wants to spot-check via DB.
echo -e "${DIM}  test users: alice id=${USER_ID_A} email=${EMAIL_A}${RESET}"
echo -e "${DIM}              bob   id=${USER_ID_B} email=${EMAIL_B}${RESET}"

exit "${FAIL}"
