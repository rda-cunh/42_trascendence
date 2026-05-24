export function PrivacyPolicy() {
  const lastUpdated = "May 23, 2026";

  return (
    <div className="app-container-narrow">
      <header className="page-header">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-description">Last updated: {lastUpdated}</p>
      </header>

      <div className="surface-padded space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            1. Introduction
          </h2>
          <p>
            This Privacy Policy describes how GameAsset Hub (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
            &ldquo;us&rdquo;) collects, uses, and protects information you provide when using our
            platform. GameAsset Hub is a student project developed as part of the 42 school
            curriculum (ft_transcendence). It is intended for educational and demonstration purposes
            only.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            2. Information We Collect
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Account information:</strong> email address, display name, password (stored
              hashed and salted), and optional avatar.
            </li>
            <li>
              <strong>Profile and listing data:</strong> items you publish for sale, descriptions,
              prices, images, and categories.
            </li>
            <li>
              <strong>Transactional data:</strong> orders, purchases, reviews, and chat messages
              exchanged with other users.
            </li>
            <li>
              <strong>Technical data:</strong> session identifiers and minimal logs required for
              security and to operate the service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To create and maintain your account and authenticate you.</li>
            <li>To display your listings, profile, and reviews to other users.</li>
            <li>To deliver real-time notifications and chat messages.</li>
            <li>To prevent abuse, fraud, and unauthorized access.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            4. Data Storage and Security
          </h2>
          <p>
            Data is stored on servers controlled by the project team. Passwords are hashed and never
            stored in plain text. All communication between your browser and our backend uses HTTPS.
            While we take reasonable precautions, no system is fully secure; do not submit sensitive
            personal data you do not want exposed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            5. Sharing of Information
          </h2>
          <p>
            We do not sell your personal data. Information you choose to make public (such as your
            display name, avatar, listings, and reviews) is visible to other users. We do not share
            data with third parties except as required to operate the service (for example, OAuth
            providers if you sign in with them).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            6. Your Rights
          </h2>
          <p>
            You can update or delete your profile information at any time from your account
            settings. To request full deletion of your account and associated data, contact the
            project team.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            7. Cookies and Local Storage
          </h2>
          <p>
            We use cookies and browser local storage strictly to keep you signed in and to remember
            basic preferences such as your theme. No third-party tracking or advertising cookies are
            used.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy as the project evolves. The &ldquo;Last updated&rdquo;
            date at the top reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">9. Contact</h2>
          <p>
            For any question related to this Privacy Policy, please contact the project team through
            the repository associated with this project.
          </p>
        </section>
      </div>
    </div>
  );
}
