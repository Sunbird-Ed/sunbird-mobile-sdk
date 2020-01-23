npm run build:prod && npm pack
npm set //registry.npmjs.org/:_ authToken=$TOKEN
npm publish project-sunbird-sunbird-sdk-*
