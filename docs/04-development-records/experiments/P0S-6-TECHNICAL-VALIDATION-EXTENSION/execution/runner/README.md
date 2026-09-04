# Future Runner Identity Requirements

`Runner = NOT_CREATED`

Reason: Execution Authority has not been created.

A future Runner may be created only after explicit Execution Authorization. Before use, its identity must be frozen with:

- canonical repository-relative and absolute paths;
- exact byte length;
- SHA-256;
- an explicit binding to the authorized Authority HEAD;
- an explicit binding to one new Invocation; and
- proof that its behavior is limited to frozen input verification, official metadata retrieval, official tarball retrieval, integrity verification, candidate derivation, and evidence generation.

The future Runner must enforce zero retry, zero resume, zero reuse, and zero second Invocation. It must not invoke npm, modify `node_modules`, enter Runtime, launch Electron, modify a source lockfile, or authorize P0.S-7.
