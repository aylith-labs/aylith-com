---
name: herdr-stith
tagline: >-
  Surface stith inside your terminal multiplexer — find any past session, and
  see where it lands before you land it.
description: >-
  A shefrd/herdr plugin that searches every past Claude session through stith's
  transcript index, previews exactly what Enter will do, and puts the session's
  live facts beside the pane that runs it.
category: developer-tools
features: []
targetUser: ''
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/herdr-stith'
---

A plugin for herdr and shefrd that searches every past Claude session through stith's transcript
index, then previews — drawn in the terminal — exactly what pressing Enter will do: which pane gets
focused if the session is already running, or which workspace and tab it would be created in if it
is not.

The preview is the point. Predicting where a session lands means mirroring a rule that has ties and
a catch-all in it, so the plugin states how good the match was rather than presenting a guess as an
answer.

Private until stith is publicly available; it is useless without the daemon.
