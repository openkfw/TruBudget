# Audit report GitHub action

## About 

Audit report action performs a filesystem scan of services/projects and image scan using trivy. Images are pulled from Docker hub. As of January 2024, only images tagged `main` are scanned.

After performing the scan, action opens or modifies an issue in the backlog.

## How to modify

As stated in GitHub documentation, including node_modules can cause problems. Action code and packages are compiled into one file (`dist/index.js`) used for distribution using a tool `vercel/ncc`.

You need to have it installed globally using 
```shell
npm i -g @vercel/ncc
```

Please double-check that you compiled a new `dist/index.js` file after modifying source files. Otherwise any intended changes won't be reflected in the GitHub action.