// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import path from 'node:path';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Nebula: A family of PowerShell modules that go beyond your workstation',
  tagline: 'Flawed by design, just like my code.',
  favicon: 'img/Nebula_Icon_Header.svg',
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  url: 'https://gioxx.github.io',
  baseUrl: '/Nebula.KB-dev/',
  organizationName: 'gioxx',
  projectName: 'Nebula.KB-dev',
  onBrokenLinks: 'throw',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'Nebula',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'projects',
        path: path.resolve('./Projects'),
        routeBasePath: 'Projects',
        sidebarPath: path.resolve('./sidebarsProjects.js'),
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true, // opens one category and closes the others
          // optional: hideable: true
        },
      },
      navbar: {
        title: 'Nebula',
        logo: {
          alt: 'Nebula KB Site Logo',
          src: 'img/Nebula_Icon_Header.svg',
        },
        items: [
          {
            to: '/Nebula/Automations/intro',
            label: 'Automations',
            position: 'left'
          },
          {
            to: '/Nebula/Core/intro',
            label: 'Core',
            position: 'left'
          },
          {
            to: '/Nebula/Log/intro',
            label: 'Log',
            position: 'left'
          },
          {
            to: '/Nebula/Tools/intro',
            label: 'Tools',
            position: 'left'
          },
          {
            type: 'html',
            position: 'left',
            value: '<span class="navbar-separator"></span>',
          },
          {
            type: 'dropdown',
            label: 'Projects',
            position: 'left',
            items: [
              { label: 'Overview', to: '/Projects/intro' },
              { label: 'Clean Mail Automation', to: '/Projects/clean-mail-automation' },
              { label: 'IntuneWinAppUtil GUI', to: '/Projects/M365/intunewinapputilgui' },
              { label: 'Microsoft 365 Tenant Checker', to: '/Projects/M365/m365-tenant-checker' },
            ],
          },
          {
            type: 'dropdown',
            label: 'Utilities',
            position: 'left',
            items: [
              { label: 'E-mail Header Analyzer', to: '/message-header-analyzer' },
              { label: 'PSADT Log Viewer', to: '/psadt-log-viewer' },
              { label: 'Quarantine E-mail Analyzer', to: '/quarantine-email-analyzer' },
            ],
          },
          {
            type: 'html',
            position: 'left',
            value: '<span class="navbar-separator"></span>',
          },
          {
            to: '/Nebula/intro',
            label: 'About',
            position: 'left'
          },
          {
            to: 'https://gioxx.org',
            label: 'Blog',
            target: '_self',
          },
          {
            href: 'https://github.com/gioxx?tab=repositories&q=Nebula',
            className: 'header-github-link',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Modules',
            items: [
              {
                label: 'Introduction',
                to: '/Nebula/im-nebula',
              },
              {
                label: 'Nebula.Automations',
                to: '/Nebula/Automations/intro',
              },
              {
                label: 'Nebula.Core',
                to: '/Nebula/Core/intro',
                // className: 'nav-core-bold',
              },
              {
                label: 'Nebula.Log',
                to: '/Nebula/Log/intro',
              },
              {
                label: 'Nebula.Tools',
                to: '/Nebula/Tools/intro',
              },
            ],
          },
          {
            title: 'Extras',
            items: [
              {
                label: 'Nebula.Scripts',
                to: '/Nebula/Scripts',
              },
              {
                label: 'Projects',
                to: '/Projects/intro',
              },
            ],
          },
          {
            title: 'Utilities',
            items: [
              {
                label: 'E-mail Header Analyzer',
                to: '/message-header-analyzer',
              },
              {
                label: 'PSADT Log Viewer',
                to: '/psadt-log-viewer',
              },
              {
                label: 'Quarantine E-mail Analyzer',
                to: '/quarantine-email-analyzer',
              },
            ],
          },
          {
            title: 'Thanks to',
            items: [
              {
                html: [
                  '<small>Microsoft, for the <a href="https://commons.wikimedia.org/wiki/File:PowerShell-Avatar_128.svg">PowerShell Avatar</a>, ',
                  '<a href="https://tabler.io/icons">Tabler Icons</a> and ',
                  '<a href="https://techicons.dev/">tech icons</a> for icons and SVG files.<br />',
                  'A final big thank you to the guys at <strong>Catppuccin</strong> for the <a href="https://github.com/catppuccin/windows-terminal/blob/main/macchiato.json">Catpuccin Macchiato</a> theme, which inspired the basic colors used in this website.</small>',
                ].join('')
              }
            ],
          },
        ],
        // copyright: `Copyright © ${new Date().getFullYear()} Gioxx. Built with Docusaurus.`,
        copyright: `<div style="color:var(--ifm-color-gray-300); padding-bottom: 9px; text-align: left;">All trademarks mentioned belong to their respective owners; third- party trademarks, product names, trade names, corporate names and companies mentioned may be trademarks of their respective owners or registered trademarks of other companies and have been used for explanatory purposes only and for the benefit of the owner, without any intention of infringing on existing copyright laws.</div>
        
        ${new Date().getFullYear()} — Lovingly developed by the usually-on-vacation brain cell of <a href="https://gfsolone.com/#seguimi" target="_blank" rel="noopener noreferrer">Gioxx</a> ❤️ — Flawed by design, just like my code 🚮`
      },
      prism: {
        additionalLanguages: ['powershell'],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
