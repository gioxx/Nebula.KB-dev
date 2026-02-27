import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import PowerShellAvatar from '@site/static/img/PowerShell-Avatar_128.svg';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* --- Flex container for left text and right image --- */}
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              Nebula modules for PowerShell
            </Heading>
            <p className="hero__subtitle">
              A family of PowerShell modules that go beyond your workstation, dedicated to the Microsoft/Office 365 world, designed and developed by those who use them every day, published to help other technicians out there, completely open source and free by choice.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link className="button button--secondary button--lg" to="/Nebula/im-nebula">
                Get started
              </Link>
              <Link className="button button--primary button--lg" to="https://github.com/gioxx?tab=repositories&q=Nebula">
                View on GitHub
              </Link>
            </div>
          </div>

          {/* --- Right-side image --- */}
          <div className={styles.heroImage}>
            <PowerShellAvatar
              className={styles.heroLogo}
              role="img"
              aria-label="PowerShell Avatar"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Nebula: PowerShell modules that scale beyond your workstation"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
