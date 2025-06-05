// src/pages/index.tsx

import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';

const HomePage: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Feather App</title>
        <meta name="description" content="Choose your mode" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Feather</h1>
        <p className={styles.description}>Select an interface to launch:</p>
        <div className={styles.grid}>
          <Link href="/fiction" legacyBehavior>
            <a className={styles.card}>
              <h2>Fiction Mode &rarr;</h2>
              <p>Read and write your stories with interactive term highlighting.</p>
            </a>
          </Link>

          <Link href="/wiki" legacyBehavior>
            <a className={styles.card}>
              <h2>Wiki Mode &rarr;</h2>
              <p>Manage and explore your knowledge base for non-fiction content.</p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;