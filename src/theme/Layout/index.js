import React from 'react';
import Layout from '@theme-original/Layout';
import SiteNotification from '@site/src/components/SiteNotification';

export default function LayoutWrapper(props) {
  return (
    <Layout {...props}>
      <SiteNotification />
      {props.children}
    </Layout>
  );
}
