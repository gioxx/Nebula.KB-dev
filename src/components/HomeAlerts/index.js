import React, { useMemo, useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import alertsData from '@site/src/data/homeAlerts.json';

const AUTO_ROTATE_MS = 8000;

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

function isDateActive(alert, now) {
  const startDate = parseStartDate(alert.startDate);
  const endDate = parseEndDate(alert.endDate);

  if (startDate && now < startDate) {
    return false;
  }

  if (endDate && now > endDate) {
    return false;
  }

  return true;
}

function sortAlerts(a, b) {
  if (Boolean(a.pinned) !== Boolean(b.pinned)) {
    return a.pinned ? -1 : 1;
  }

  const aDate = a.publishedAt ? new Date(`${a.publishedAt}T00:00:00`).getTime() : 0;
  const bDate = b.publishedAt ? new Date(`${b.publishedAt}T00:00:00`).getTime() : 0;

  return bDate - aDate;
}

function severityLabel(severity) {
  if (severity === 'high') {
    return 'High';
  }

  if (severity === 'medium') {
    return 'Medium';
  }

  return 'Info';
}

export default function HomeAlerts() {
  const alerts = useMemo(() => {
    const now = new Date();

    return alertsData
      .filter((alert) => alert.enabled !== false)
      .filter((alert) => isDateActive(alert, now))
      .sort(sortAlerts);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (alerts.length <= 1 || isPaused) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % alerts.length);
    }, AUTO_ROTATE_MS);

    return () => clearInterval(intervalId);
  }, [alerts.length, isPaused]);

  useEffect(() => {
    if (activeIndex >= alerts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, alerts.length]);

  if (alerts.length === 0) {
    return null;
  }

  const activeAlert = alerts[activeIndex];
  const badgeClassName = `${styles.badge} ${styles[`badge${severityLabel(activeAlert.severity)}`]}`;

  const showControls = alerts.length > 1;

  const nextAlert = () => {
    setActiveIndex((prev) => (prev + 1) % alerts.length);
  };

  const prevAlert = () => {
    setActiveIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
  };

  const pauseRotation = () => {
    setIsPaused(true);
  };

  const resumeRotation = () => {
    setIsPaused(false);
  };

  const handleBlurCapture = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      resumeRotation();
    }
  };

  return (
    <section
      className={styles.wrapper}
      aria-label="Home alerts"
      onMouseEnter={pauseRotation}
      onMouseLeave={resumeRotation}
      onFocusCapture={pauseRotation}
      onBlurCapture={handleBlurCapture}
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <span className={badgeClassName}>{severityLabel(activeAlert.severity)}</span>
          <div className={styles.copy}>
            <strong>{activeAlert.title}</strong>
            <p>{activeAlert.message}</p>
          </div>
          <Link className={styles.cta} to={activeAlert.href}>
            {activeAlert.ctaLabel || 'Read more'}
          </Link>
        </div>

        {showControls && (
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.controlButton}
              onClick={prevAlert}
              aria-label="Previous alert"
            >
              Prev
            </button>
            <span className={styles.counter}>{activeIndex + 1} / {alerts.length}</span>
            <button
              type="button"
              className={styles.controlButton}
              onClick={nextAlert}
              aria-label="Next alert"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
