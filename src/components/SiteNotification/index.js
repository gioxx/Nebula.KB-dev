import React, { useEffect, useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import useIsBrowser from '@docusaurus/useIsBrowser';
import styles from './styles.module.css';
import siteNotification from '@site/src/data/siteNotification.json';

const STORAGE_PREFIX = 'nebula:site-notification:dismissed:';

function parseStartDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  return new Date(`${dateValue}T00:00:00`);
}

function parseEndDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  return new Date(`${dateValue}T23:59:59`);
}

function isDateActive(notification, now) {
  const startDate = parseStartDate(notification.startDate);
  const endDate = parseEndDate(notification.endDate);

  if (startDate && now < startDate) {
    return false;
  }

  if (endDate && now > endDate) {
    return false;
  }

  return true;
}

function getVariantClassName(variant) {
  if (variant === 'danger') {
    return styles.variantDanger;
  }

  if (variant === 'info') {
    return styles.variantInfo;
  }

  return styles.variantWarning;
}

export default function SiteNotification() {
  const isBrowser = useIsBrowser();
  const [isDismissed, setIsDismissed] = useState(false);

  const isActive = useMemo(() => {
    if (siteNotification.enabled === false) {
      return false;
    }

    return isDateActive(siteNotification, new Date());
  }, []);

  const notificationId = siteNotification.id || 'default';
  const storageKey = `${STORAGE_PREFIX}${notificationId}`;
  const isDismissible = siteNotification.isDismissible !== false;

  useEffect(() => {
    if (!isBrowser || !isDismissible || !isActive) {
      return;
    }

    setIsDismissed(window.localStorage.getItem(storageKey) === '1');
  }, [isBrowser, isDismissible, isActive, storageKey]);

  if (!isBrowser || !isActive || isDismissed) {
    return null;
  }

  const wrapperClassName = `${styles.wrapper} ${getVariantClassName(siteNotification.variant)}`;

  const dismissNotification = () => {
    if (isDismissible) {
      window.localStorage.setItem(storageKey, '1');
    }
    setIsDismissed(true);
  };

  return (
    <section className={wrapperClassName} aria-label="Site notification">
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          {siteNotification.title && <strong className={styles.title}>{siteNotification.title}</strong>}
          {siteNotification.message && <span className={styles.message}>{siteNotification.message}</span>}
          {siteNotification.linkHref && (
            <Link className={styles.link} to={siteNotification.linkHref}>
              {siteNotification.linkLabel || 'Read more'}
            </Link>
          )}
        </div>

        {isDismissible && (
          <button
            type="button"
            className={styles.dismiss}
            onClick={dismissNotification}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        )}
      </div>
    </section>
  );
}
