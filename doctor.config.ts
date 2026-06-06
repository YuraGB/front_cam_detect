import type { ReactDoctorConfig } from 'react-doctor/api'

export default {
  lint: true,
  rules: {
    'react-doctor/no-array-index-as-key': 'off',
  },
  ignore: {
    overrides: [
      {
        files: ['src/routes/__root.tsx'],
        rules: ['react-doctor/only-export-components'],
      },
    ],
    files: [
      'src/integrations/tanstack-query/devtools.tsx', // generated
      'src/integrations/tanstack-query/root-provider.tsx', // generated
      'src/paraglide/**/*.js', // generated
      'src/components/ui/*.tsx', // generated shadcn-ui
      'src/integrations/tanstack-query/query-client.ts', // generated
      'instrument.server.mjs', // generated
      'src/lib/utils.ts', // generated
      'src/hooks/use-mobile.ts', // generated
    ],
  },
} satisfies ReactDoctorConfig
