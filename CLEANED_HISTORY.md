Repository History Cleanup (Build Artifacts Purge)
=================================================

Context
-------
Large Next.js build artifacts (`.next-build/` directory) were historically committed, inflating the repository and causing push failures/timeouts. We performed a destructive history rewrite to excise all traces of `.next-build` from every commit.

Actions Performed
-----------------
1. Added `/.next-build/` to `.gitignore` earlier and removed it from the working tree (already committed).
2. Created a mirror backup of the original repository directory locally (`git clone --mirror ... repo-history-backup`) for safety.
3. Ran `git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch .next-build" --prune-empty --tag-name-filter cat -- --all` to remove the directory from all commits.
4. Ran aggressive garbage collection (`git gc --prune=now --aggressive`).
5. Verified pack file size dropped and that no refs mention `.next-build`.
6. Force-pushed the rewritten refs to `origin`.
7. Installed a pre-commit hook (earlier step) to prevent future build artifacts or large blobs from re-entering history.

Result
------
Current largest single pack file is ~106MB (previous individual blobs >160MB were present). The `.next-build` directory is no longer in any commit history locally.

What Collaborators Must Do
--------------------------
Because commit hashes were rewritten, every collaborator MUST sync cleanly:
Option A (recommended / simplest):
 1. Move any unpushed local changes elsewhere (`git diff > patch.txt`).
 2. Delete local clone.
 3. Re-clone fresh: `git clone <repo-url>`.

Option B (advanced / keep uncommitted work):
 1. Fetch rewritten refs: `git fetch origin`.
 2. Hard reset: `git reset --hard origin/main`.
 3. Prune old objects: `git reflog expire --expire=now --all && git gc --prune=now --aggressive`.

IMPORTANT: Anyone who does not clean their local clone will continue to retain the old large objects, defeating storage reduction.

Verification Steps
------------------
Run these locally (optional):
1. Ensure `.next-build` is ignored: `git check-ignore -v .next-build` (should list the ignore rule).
2. List largest 15 blobs:
   PowerShell example:
   `git verify-pack -v (Get-ChildItem .git/objects/pack/*.idx) 2>$null | Select-String " blob " | ForEach-Object { $_.ToString().Split(" ") | Where-Object { $_ } } | Out-String` (or use a Unix-like shell for simpler parsing).
3. Confirm no paths containing `.next-build` in history:
   `git log -p --name-only | Select-String ".next-build"` (should return nothing).

Preventing Regression
---------------------
1. Do NOT commit build output (`.next-build/`, `.next/`, `dist/`, etc.).
2. If a large file (>5MB) is genuinely needed (e.g., design asset), prefer Git LFS or external storage.
3. Pre-commit hook already blocks oversized files and runs secret scan—keep it executable / installed.
4. CI (future): Add a lightweight job to assert absence of build directories in diffs.

Rollback Plan
-------------
If something critical was lost (unexpected), restore from the safety mirror clone created before rewrite. Copy the needed file(s) and recommit them (without build artifacts) or cherry-pick the specific pre-rewrite commit range inside a detached checkout.

Next Potential Improvements
---------------------------
- Add `CONTRIBUTING.md` codifying size & secrets policies.
- Adopt `git filter-repo` (faster, simpler) for any future rewrites (requires Python environment).
- Optional: GitHub Action to fail if `.next-build` appears in a PR diff.

Timestamp
---------
Cleanup executed on: (local system time of rewrite). Update manually if needed.

— End of Document —
