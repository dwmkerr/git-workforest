## 1. Man Page Generation

- [x] 1.1 Add a deterministic roff renderer for the exported Commander program
- [x] 1.2 Add a generator script and create canonical and alias section 1 pages

## 2. Package Integration

- [x] 2.1 Declare the manual files and generator in npm package contents
- [x] 2.2 Regenerate manual pages during the npm prepack lifecycle

## 3. Verification

- [x] 3.1 Add tests that compare checked-in pages with the current CLI model and package metadata
- [x] 3.2 Run lint, tests, build, and strict OpenSpec validation
- [x] 3.3 Pack and install into a temporary npm prefix, then render every manual alias and `git help forest`
