import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const moduleCards = [
  {
    name: 'Automations',
    blurb: 'Reusable blocks for scripts and cloud integrations (Graph, mail, webhooks).',
    gallery: 'https://www.powershellgallery.com/packages/Nebula.Automations',
    icon: require('@site/static/img/Nebula.Automations.png').default
  },
  {
    name: 'Core',
    blurb: 'A PowerShell module that go beyond your workstations. It will make your Microsoft 365 life easier.',
    gallery: 'https://www.powershellgallery.com/packages/Nebula.Core',
    icon: require('@site/static/img/Nebula.Core.png').default
  },
  {
    name: 'Log',
    blurb: 'A lightweight and configurable logging module for PowerShell scripts.',
    gallery: 'https://www.powershellgallery.com/packages/Nebula.Log',
    icon: require('@site/static/img/Nebula.Log.png').default
  },
  {
    name: 'Tools',
    blurb: 'Everyday functions and utilities for PowerShell.',
    gallery: 'https://www.powershellgallery.com/packages/Nebula.Tools',
    icon: require('@site/static/img/Nebula.Tools.png').default
  }
];

const FeatureList = [
  {
    title: 'Modular by design',
    Svg: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-box"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
        <path d="M12 12l8 -4.5" />
        <path d="M12 12l0 9" />
        <path d="M12 12l-8 -4.5" />
      </svg>
    ),
    description: (
      <>
        Independent modules, each with its own main functions and ad-hoc developed code.
        You choose which ones to use based on your needs.
      </>
    ),
  },
  {
    title: 'Open',
    Svg: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-brand-github"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
      </svg>
    ),
    description: (
      <>
        MIT-licensed and on GitHub: Nebula.Automations, Nebula.Core, Nebula.Log, Nebula.Tools (and also Nebula.Scripts) ready to fork, PR, and evolve with your runbooks.
      </>
    ),
  },
  {
    title: 'PowerShell-first',
    Svg: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-brand-powershell"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4.887 20h11.868c.893 0 1.664-.665 1.847-1.592l2.358-12c.212-1.081-.442-2.14-1.462-2.366a1.784 1.784 0 0 0-.385-.042h-11.868c-.893 0-1.664.665-1.847 1.592l-2.358 12c-.212 1.081.442 2.14 1.462 2.366c.127.028.256.042.385.042z" />
        <path d="M9 8l4 4l-6 4" />
        <path d="M12 16h3" />
      </svg>
    ),
    description: (
      <>
        Native PowerShell highlighting knowledge base, task-oriented snippets, and examples you can paste into your terminal.
      </>
    ),
  }
];

const PlaybookList = [
  {
    title: 'Licensing audit',
    subtitle: 'Refresh SKU catalog and export assignments in one pass.',
    steps: [
      'Update-LicenseCatalog -Force',
      'Export-MsolAccountSku -CsvFolder C:\\Temp\\Nebula\\Licenses',
      'Get-UserMsolAccountSku -UserPrincipalName admin@contoso.com'
    ]
  },
  {
    title: 'Shared mailbox hardening',
    subtitle: 'Provision, set language/timezone, and set explicit permissions.',
    steps: [
      "New-SharedMailbox -Name 'Support' -PrimarySmtpAddress support@contoso.com",
      'Set-MboxLanguage -Identity support@contoso.com -Language it-IT -TimeZone W. Europe Standard Time',
      'Add-MboxPermission -Identity support@contoso.com -User helpdesk@contoso.com -AccessRights FullAccess -AutoMapping:$false'
    ]
  },
  {
    title: 'Group inventory',
    subtitle: 'Export distribution and M365 groups with members to CSV.',
    steps: [
      "Export-DistributionGroups -CSVFolder 'C:\\Temp\\Nebula\\DGs'",
      "Export-DynamicDistributionGroups -CSVFolder 'C:\\Temp\\Nebula\\DynDGs'",
      "Export-M365Group -CSVFolder 'C:\\Temp\\Nebula\\M365'"
    ]
  },
  {
    title: 'Quarantine triage',
    subtitle: 'Search, export, and release/delete in bulk with guardrails.',
    steps: [
      "Search-QuarantineMessage -Sender 'suspicious@spam.com' -CsvFolder 'C:\\Temp\\Nebula\\Quarantine'",
      "Export-QuarantineMessage -NetworkMessageId '<messageid>' -Folder 'C:\\Temp\\Nebula\\Quarantine\\eml'",
      'Remove-QuarantineMessage -NetworkMessageId <messageid> -Confirm:$false'
    ]
  }
];

function Feature({ Svg, title, description }) {
  return (
    <article className="nebula-card">
      <div className={styles.titleWithIcon}>
        <Svg className={styles.titleIcon} role="img" aria-label={title} />
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
      </div>
      <p>{description}</p>
    </article>
  );
}

export default function HomepageFeatures() {
  return (
    <section className="container" style={{ padding: '2rem 0 4rem' }}>
      <div className="nebula-features">
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} imageRight={idx % 2 === 1} />
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className={styles.sectionHeading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.headingIcon}
            aria-hidden="true"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M7 9l2 2l-2 2" />
            <path d="M13 13h4" />
          </svg>
          <Heading as="h2">Quick peek</Heading>
        </div>
        <div className={styles.psWindow}>
          <div className={styles.psTitlebar}>
            <div className={styles.psDots} aria-hidden="true">
              <span className={styles.psDotRed} />
              <span className={styles.psDotAmber} />
              <span className={styles.psDotGreen} />
            </div>
            <span className={styles.psTitle}>Windows PowerShell</span>
            <span className={styles.psTitleHint}>Admin · Nebula.Core demo</span>
          </div>
          <pre className={styles.psBody}>
            <code className="language-powershell">{`# Install and import Nebula.Core
Install-Module Nebula.Core -Scope CurrentUser
Import-Module Nebula.Core

# Connect EXO + Graph (auto-installs prereqs)
Connect-Nebula -GraphScopes 'Directory.Read.All','User.Read.All' -AutoInstall

# Inspect config and refresh license catalog
Get-NebulaConfig
Update-LicenseCatalog -Force

# Export DGs and check one user's licenses
Export-DistributionGroups -CSVFolder 'C:\\Temp\\Nebula\\DGs'
Get-UserMsolAccountSku -UserPrincipalName 'user@contoso.com'

# Disconnect sessions
Disconnect-Nebula
`}</code>
          </pre>
        </div>
      </div>

      <div className={clsx(styles.moduleStrip, styles.fullWidthBreakout)}>
        <div className={styles.moduleStripInner}>
          <div className={styles.moduleStripHeader}>
            <Heading as="h2">Nebula is available on PowerShell Gallery</Heading>
            <p>Install with one command. Designed to mix Core, Automations, Log and Tools where needed. Ready to go out of the box, or adapt to your needs.</p>
          </div>
          <div className={styles.moduleStripGrid}>
            {moduleCards.map((mod) => (
              <article key={mod.name} className={styles.moduleStripCard}>
                <div className={styles.moduleStripTitle}>
                  <img src={mod.icon} alt={mod.name} className={styles.moduleLogo} />
                  <Heading as="h3" className={styles.moduleName}>{mod.name}</Heading>
                </div>
                <Link className={styles.moduleVersion} to={mod.gallery}>
                  <img
                    src={`https://img.shields.io/powershellgallery/v/Nebula.${mod.name}?label=PowerShell%20Gallery`}
                    alt={`PowerShell Gallery ${mod.name} version`}
                    loading="lazy"
                  />
                </Link>
                <p className={styles.moduleStripBlurb}>{mod.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* <div style={{ marginTop: '2rem' }}>
        <div className={styles.sectionHeading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.headingIcon}
            aria-hidden="true"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1.002l3.093 -6.253l3.093 6.253l6.9 1.002l-5 4.867l1.179 6.873z" />
          </svg>
          <Heading as="h2">Popular playbooks</Heading>
        </div>
        <div className={styles.playbookGrid}>
          {PlaybookList.map(({ title, subtitle, steps }, idx) => (
            <article key={idx} className="nebula-card">
              <Heading as="h4" className={styles.playbookTitle}>{title}</Heading>
              <p className={styles.playbookSubtitle}>{subtitle}</p>
              <ul className={styles.playbookList}>
                {steps.map((step, stepIdx) => (
                  <li key={stepIdx}><code>{step}</code></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div> */}
    </section>
  );
}
