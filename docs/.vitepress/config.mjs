import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BINDAC',
  description: 'BIND9 Infrastructure-as-Code library for TypeScript',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API Reference', link: '/api/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'CLI Usage', link: '/guide/cli-usage' },
            { text: 'Docker Usage', link: '/guide/docker-usage' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Simple Zone', link: '/examples/simple-zone' },
            { text: 'Complex Zone', link: '/examples/complex-zone' },
            { text: 'Multiple Zones', link: '/examples/multiple-zones' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MarkusBansky/bindac' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Markiian Benovskyi'
    }
  }
})