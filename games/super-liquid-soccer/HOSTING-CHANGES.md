# Hosting Changes

Compared with the pinned source's index.html:

- Title is Super Liquid Soccer.
- Removed the unconditional portal-navigation redirect to ubg98.github.io.
- Removed the portal analytics and promotional-client script includes.
- Corrected the PCK download-size hint to 13,430,256 bytes.
- Disabled PWA registration and removed its manifest link. The supplied manifest
  references absent 180px and 512px icons; offline installation is not required.

No engine, game payload, SDK, ad callback, origin check, or gameplay code was
changed. All required runtime files are retained byte-for-byte. The original
entrypoint remains available at the pinned source commit.
