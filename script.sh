npm run build:prod && npm pack
npm set //registry.npmjs.org/:_ authToken=$NPM_TOKEN
npm publish project-sunbird-sunbird-sdk-*
