# BitLife browser package

Imported from HTML5GameArchive/gfiles, bitlife/, commit
870aeb6cd4d4d14ad8d7f0a537eb8d7a42fe1f3a.

Publication authorization: the ELA Hub owner reports receiving permission
in person from the rights holders to copy and publicly self-host this package.
This report has not been independently verified and is not an open-source licence.
Original game and asset ownership remain with their respective rights holders.

Hosting changes: removed the missing portal-only /cloak.js reference.

2026-10-18 update: the loader and compressed framework are from
a456pur/seraph, games/bitlife/Build/, pinned at commit
ae2fcc6d6a9cd051654fcc0519080db1f79cf2a7. Both files are byte-for-byte copies.
The data and WebAssembly files are identical to that source (Git blob hashes
d44b3489b5236273253ef9e18283ee0786f5bf93 and
965d3b678e84c064f2dd0f3a1be8e4a365462dba). The existing HTML, Unity configuration,
progress assets, logo and domain.txt are retained.

The previous framework requested /main.min.js, an absent root-level SDK file.
The replacement preserves the source's original GameDistribution SDK URL;
no SDK checks, ads, rewards or access controls have been bypassed.
See ASSET-MANIFEST.json for core runtime integrity checks.

The owner explicitly approved publication of this update on 2026-10-18.
The owner reports the white screen only on school devices; personal-device
startup and age progression do not verify school network access or device
compatibility. A repeated fullscreen/resize check produced a blank canvas in
local testing; that remaining issue has been disclosed and is not claimed fixed.
