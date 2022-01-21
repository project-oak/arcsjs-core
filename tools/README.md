# Tools

## Important

These scripts only work when `CWD` is `/` (application root).

### Using `npm run`

You can use `npm run <tool>` to run tools from anywhere in the tree, without worrying about the `CWD`.

E.g.
```
npm run build
```
The `build` tool prepares the checkout for deployment.

If you are using tools frequencly, consider simplifying like so:
```
alias run='npm run'
```
and then
```
run build
```
