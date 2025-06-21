### main repo --> frontend repo

- git subtree push --prefix=frontend frontend-origin main

### main repo --> backend repo

- git subtree push --prefix=backend backend-origin main

git config pull.rebase true
git submodule update --remote --merge
