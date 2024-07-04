# lint-tools

Quickly introduce quality and consistency

- biome
- markuplint
- stylelint
- cspell
- ls-lint
- lefthook
- editorconfig
Use the bun create command to immediately introduce the lint tool into the project.

add your project

```bash
bun create monosus/lint-tools
```

If you are using vue, svelt htmx, etc., please install the corresponding markuplint parser and specs

use lint

```bash
bun lint
```

---

## Maintenance of this Repository

To install dependencies:

```bash
bun install
```


This project was created using `bun init` in bun v1.1.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
