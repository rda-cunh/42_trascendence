export function TermsOfService() {
  const lastUpdated = "May 23, 2026";

  return (
    <div className="app-container-narrow">
      <header className="page-header">
        <h1 className="page-title">Terms of Service</h1>
        <p className="page-description">Last updated: {lastUpdated}</p>
      </header>

      <div className="surface-padded space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account or using GameAsset Hub (the &ldquo;Service&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree, you must not
            use the Service. GameAsset Hub is a student project developed for the 42 school
            curriculum (ft_transcendence) and is provided for educational and demonstration
            purposes only.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            2. Eligibility and Accounts
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>You must provide accurate information when registering.</li>
            <li>
              You are responsible for keeping your credentials secure and for all activity
              that occurs under your account.
            </li>
            <li>
              You must not impersonate another person or create accounts using false
              identities.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            3. User Content and Listings
          </h2>
          <p>
            You retain ownership of the content you publish (listings, images, messages,
            reviews). By publishing it, you grant us a non-exclusive right to display it on
            the Service so it can fulfil its function. You must only publish content for
            which you hold the necessary rights.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            4. Prohibited Conduct
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>No unlawful, fraudulent, harassing, hateful, or sexually explicit content.</li>
            <li>No infringement of intellectual property or other rights of third parties.</li>
            <li>
              No attempts to disrupt, attack, reverse-engineer, or gain unauthorized access
              to the Service or other users&rsquo; accounts.
            </li>
            <li>
              No automated scraping or use of the API outside the documented rate limits.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            5. Transactions
          </h2>
          <p>
            GameAsset Hub is a demonstration marketplace. Any &ldquo;purchase&rdquo;,
            &ldquo;cart&rdquo;, or &ldquo;checkout&rdquo; action performed on this platform
            is simulated for educational purposes and does not constitute a real commercial
            transaction. No real payment is processed, and no enforceable contract of sale
            is created between users.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            6. Moderation and Termination
          </h2>
          <p>
            We may remove content or suspend accounts that violate these Terms or the rules
            stated in the Privacy Policy. You may delete your account at any time from your
            profile settings.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            7. Disclaimer of Warranties
          </h2>
          <p>
            The Service is provided &ldquo;as is&rdquo;, without warranty of any kind.
            Because this is a student project, it may contain bugs, downtime, or data losses.
            Do not store information you cannot afford to lose.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            8. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, the project team shall not be
            liable for any indirect, incidental, or consequential damages arising from the
            use of, or inability to use, the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            9. Changes to These Terms
          </h2>
          <p>
            These Terms may be updated as the project evolves. Continued use of the Service
            after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            10. Contact
          </h2>
          <p>
            For any question related to these Terms, please contact the project team through
            the repository associated with this project.
          </p>
        </section>
      </div>
    </div>
  );
}
