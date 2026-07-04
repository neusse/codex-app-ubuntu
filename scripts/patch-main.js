#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];

if (!appDir) {
  console.error('usage: node scripts/patch-main.js /path/to/extracted/app');
  process.exit(2);
}

function fail(message) {
  console.error(`patch-main: ${message}`);
  process.exit(1);
}

function findMainBundle(root) {
  const buildDir = path.join(root, '.vite', 'build');
  if (!fs.existsSync(buildDir)) {
    fail(`missing build directory: ${buildDir}`);
  }
  const candidates = fs
    .readdirSync(buildDir)
    .filter((name) => /^main-.*\.js$/.test(name))
    .map((name) => path.join(buildDir, name));
  if (candidates.length !== 1) {
    fail(`expected one main-*.js bundle in ${buildDir}, found ${candidates.length}`);
  }
  return candidates[0];
}

function findBundle(root, name) {
  const bundlePath = path.join(root, '.vite', 'build', name);
  if (!fs.existsSync(bundlePath)) {
    fail(`missing bundle: ${bundlePath}`);
  }
  return bundlePath;
}

function replaceOnce(source, name, from, to) {
  if (source.includes(to)) {
    console.log(`already patched: ${name}`);
    return source;
  }
  const count = source.split(from).length - 1;
  if (count !== 1) {
    fail(`${name}: expected one match, found ${count}`);
  }
  console.log(`patched: ${name}`);
  return source.replace(from, to);
}

function replaceOnceFromAny(source, name, fromCandidates, to) {
  if (source.includes(to)) {
    console.log(`already patched: ${name}`);
    return source;
  }
  const matches = fromCandidates
    .map((from) => ({ from, count: source.split(from).length - 1 }))
    .filter(({ count }) => count > 0);
  const total = matches.reduce((sum, { count }) => sum + count, 0);
  if (total !== 1) {
    fail(`${name}: expected one match, found ${total}`);
  }
  console.log(`patched: ${name}`);
  return source.replace(matches[0].from, to);
}

const mainPath = findMainBundle(appDir);
let source = fs.readFileSync(mainPath, 'utf8');

source = replaceOnce(
  source,
  'linux opaque window background',
  ':e===`win32`&&!S9(t)?{backgroundColor:X7,backgroundMaterial:`mica`}:{backgroundColor:X7,backgroundMaterial:null}}function k9',
  ':e===`win32`&&!S9(t)?{backgroundColor:X7,backgroundMaterial:`mica`}:e===`linux`&&!S9(t)?{backgroundColor:r?Z7:Q7,backgroundMaterial:null}:{backgroundColor:X7,backgroundMaterial:null}}function k9',
);

source = replaceOnce(
  source,
  'linux managed primary and hotkey windows',
  'case`hotkeyWindowHome`:return A9({platform:n,resizable:!1,thickFrame:!1});case`hotkeyWindowThread`:return A9({platform:n,resizable:!0});case`primary`:return n===`darwin`?t?{titleBarStyle:`hiddenInset`,trafficLightPosition:d9(r)}:{vibrancy:`menu`,titleBarStyle:`hiddenInset`,trafficLightPosition:d9(r)}:n===`win32`||n===`linux`?{titleBarStyle:`hidden`,titleBarOverlay:f9(r)}:{titleBarStyle:`default`};',
  'case`hotkeyWindowHome`:return n===`linux`?{titleBarStyle:`default`,skipTaskbar:!1,minimizable:!0,maximizable:!0,fullscreenable:!0,resizable:!0}:A9({platform:n,resizable:!1,thickFrame:!1});case`hotkeyWindowThread`:return n===`linux`?{titleBarStyle:`default`,skipTaskbar:!1,minimizable:!0,maximizable:!0,fullscreenable:!0,resizable:!0}:A9({platform:n,resizable:!0});case`primary`:return n===`linux`?{frame:!0,skipTaskbar:!1,minimizable:!0,maximizable:!0,fullscreenable:!0,resizable:!0,transparent:!1}:n===`darwin`?t?{titleBarStyle:`hiddenInset`,trafficLightPosition:d9(r)}:{vibrancy:`menu`,titleBarStyle:`hiddenInset`,trafficLightPosition:d9(r)}:n===`win32`?{titleBarStyle:`hidden`,titleBarOverlay:f9(r)}:{titleBarStyle:`default`};',
);

source = replaceOnce(
  source,
  'omit undefined focusable option',
  'backgroundColor:A,show:l,parent:p,focusable:m,...process.platform===`win32`||process.platform===`linux`?{autoHideMenuBar:!0}:{}',
  'backgroundColor:A,show:l,parent:p,...m===void 0?{}:{focusable:m},...process.platform===`win32`||process.platform===`linux`?{autoHideMenuBar:!0}:{}',
);

source = replaceOnce(
  source,
  'titlebar overlay only on Windows',
  'installApplicationMenuTitleBarOverlaySync(e,t){if(process.platform!==`win32`&&process.platform!==`linux`||t!==`primary`)return;',
  'installApplicationMenuTitleBarOverlaySync(e,t){if(process.platform!==`win32`||t!==`primary`)return;',
);

source = replaceOnce(
  source,
  'window zoom overlay only on Windows',
  'process.platform===`darwin`?n.setWindowButtonPosition(d9(t)):(process.platform===`win32`||process.platform===`linux`)&&(this.windowZooms.set(n.id,t),n.setTitleBarOverlay(f9(t)))',
  'process.platform===`darwin`?n.setWindowButtonPosition(d9(t)):process.platform===`win32`&&(this.windowZooms.set(n.id,t),n.setTitleBarOverlay(f9(t)))',
);

source = replaceOnce(
  source,
  'do not force-center Linux onboarding window',
  'n.setResizable(!1),n.setMaximizable(!1),n.setFullScreenable(!1),n.setMinimumSize(i.width,i.height),n.setSize(i.width,i.height),n.center(),this.showPrimaryWindow(n);return',
  'process.platform===`linux`?(n.setResizable(!0),n.setMaximizable(!0),n.setFullScreenable(!0),n.setMinimumSize(Math.min(i.width,480),Math.min(i.height,600)),n.setSize(i.width,i.height)): (n.setResizable(!1),n.setMaximizable(!1),n.setFullScreenable(!1),n.setMinimumSize(i.width,i.height),n.setSize(i.width,i.height),n.center()),this.showPrimaryWindow(n);return',
);

source = replaceOnce(
  source,
  'hotkey windows stay on current Linux workspace',
  'process.platform===`darwin`?e.setVisibleOnAllWorkspaces(!0,{visibleOnFullScreen:!0,skipTransformProcessType:!0}):e.setVisibleOnAllWorkspaces(!0)),e.moveTop())}showAndFocus',
  'process.platform===`darwin`?e.setVisibleOnAllWorkspaces(!0,{visibleOnFullScreen:!0,skipTransformProcessType:!0}):process.platform===`linux`?e.setVisibleOnAllWorkspaces(!1):e.setVisibleOnAllWorkspaces(!0)),process.platform!==`linux`&&e.moveTop())}showAndFocus',
);

source = replaceOnce(
  source,
  'linux file manager target',
  'AM=Zj({id:`fileManager`,label:`Finder`,icon:`apps/finder.png`,kind:`fileManager`,darwin:{detect:()=>`open`,args:e=>cs(e)},win32:{label:`File Explorer`,icon:`apps/file-explorer.png`,detect:jM,args:e=>cs(e),open:async({path:e})=>MM(e)}});function jM',
  'AM=Zj({id:`fileManager`,label:`Finder`,icon:`apps/finder.png`,kind:`fileManager`,darwin:{detect:()=>`open`,args:e=>cs(e)},win32:{label:`File Explorer`,icon:`apps/file-explorer.png`,detect:jM,args:e=>cs(e),open:async({path:e})=>MM(e)},linux:{label:`File Manager`,icon:`apps/finder.png`,detect:()=>`xdg-open`,args:e=>cs(e),open:async({path:e})=>MM(e)}});function jM',
);

source = replaceOnce(
  source,
  'linux-aware open target helper',
  'function Qj({id:e,label:t,icon:n,darwinDetect:r,win32Detect:i,darwinEnv:a,darwinArgs:o,hidden:s}){return{id:e,platforms:{darwin:r?{label:t,icon:n,kind:`editor`,hidden:s,detect:r,env:a,args:o??$j,supportsSsh:!0}:void 0,win32:i?{label:t,icon:n,kind:`editor`,hidden:s,detect:i,args:$j,supportsSsh:!0}:void 0}}}',
  'function Qj({id:e,label:t,icon:n,darwinDetect:r,win32Detect:i,linuxDetect:l,linuxOpen:u,darwinEnv:a,darwinArgs:o,hidden:s}){return{id:e,platforms:{darwin:r?{label:t,icon:n,kind:`editor`,hidden:s,detect:r,env:a,args:o??$j,supportsSsh:!0}:void 0,win32:i?{label:t,icon:n,kind:`editor`,hidden:s,detect:i,args:$j,supportsSsh:!0}:void 0,linux:l?{label:t,icon:n,kind:`editor`,hidden:s,detect:l,args:$j,open:u,supportsSsh:!0}:void 0}}}',
);

source = replaceOnceFromAny(
  source,
  'linux file manager opener',
  [
    'async function MM(e){let{shell:t}=await import(`electron`),n=NM(e);if(n&&(0,u.statSync)(n).isFile()){t.showItemInFolder(n);return}let r=n??e,i=await t.openPath(r);if(i)throw Error(i)}function NM',
    'async function MM(e){let{shell:t}=await import(`electron`),n=NM(e);if(process.platform===`linux`){let t=n??e;try{n&&(0,u.statSync)(n).isFile()&&(t=(0,s.dirname)(n))}catch{}await _codexLinuxOpenFileManager(t);return}if(n&&(0,u.statSync)(n).isFile()){t.showItemInFolder(n);return}let r=n??e,i=await t.openPath(r);if(i)throw Error(i)}async function _codexLinuxOpenFileManager(e){let{spawn:t}=await import(`node:child_process`),n=process.env.CODEX_LINUX_FILE_MANAGER?.trim()||`xdg-open`,r=t(n,[e],{detached:!0,stdio:`ignore`});r.on(`error`,()=>{}),r.unref()}function NM',
  ],
  'async function MM(e){let{shell:t}=await import(`electron`),n=NM(e);if(process.platform===`linux`){await _codexLinuxRevealPath(n??e);return}if(n&&(0,u.statSync)(n).isFile()){t.showItemInFolder(n);return}let r=n??e,i=await t.openPath(r);if(i)throw Error(i)}async function _codexLinuxOpenFileManager(e){let{spawn:t}=await import(`node:child_process`),n=process.env.CODEX_LINUX_FILE_MANAGER?.trim()||`xdg-open`,r=t(n,[e],{detached:!0,stdio:`ignore`});r.on(`error`,()=>{}),r.unref()}async function _codexLinuxRevealPath(e){let t=e;try{(0,u.statSync)(e).isFile()&&(t=(0,s.dirname)(e))}catch{}await _codexLinuxOpenFileManager(t)}function NM',
);

source = replaceOnce(
  source,
  'linux downloads folder opener',
  'async function tV(e){let t=await a.shell.openPath(e);return t?{message:t,ok:!1,reason:`open-failed`}:{ok:!0}}',
  'async function tV(e){if(process.platform===`linux`)return await _codexLinuxOpenFileManager(e),{ok:!0};let t=await a.shell.openPath(e);return t?{message:t,ok:!1,reason:`open-failed`}:{ok:!0}}',
);

source = replaceOnce(
  source,
  'linux show downloaded file in folder',
  'try{return a.shell.showItemInFolder(n.path),{ok:!0}}catch(e){return{message:t.xs(e),ok:!1,reason:`show-in-folder-failed`}}',
  'try{return process.platform===`linux`?_codexLinuxRevealPath(n.path):a.shell.showItemInFolder(n.path),{ok:!0}}catch(e){return{message:t.xs(e),ok:!1,reason:`show-in-folder-failed`}}',
);

source = replaceOnce(
  source,
  'linux show completed download in folder',
  'p.default.platform===`darwin`&&a.app.dock.downloadFinished(e),t.openFolderWhenDone&&a.shell.showItemInFolder(e),typeof t.onCompleted==`function`&&t.onCompleted',
  'p.default.platform===`darwin`&&a.app.dock.downloadFinished(e),t.openFolderWhenDone&&(process.platform===`linux`?_codexLinuxRevealPath(e):a.shell.showItemInFolder(e)),typeof t.onCompleted==`function`&&t.onCompleted',
);

source = replaceOnce(
  source,
  'linux show permission app in folder',
  'showPermissionSettingsAppInFinder:async()=>{try{a.shell.showItemInFolder(r.S())}catch(e){B0().error(`Show permission settings app in Finder failed`,{safe:{},sensitive:{error:e}})}}',
  'showPermissionSettingsAppInFinder:async()=>{try{process.platform===`linux`?_codexLinuxRevealPath(r.S()):a.shell.showItemInFolder(r.S())}catch(e){B0().error(`Show permission settings app in Finder failed`,{safe:{},sensitive:{error:e}})}}',
);

source = replaceOnce(
  source,
  'linux image context menu reveal',
  'return n==null?[]:[{label:J7,click:()=>{a.shell.showItemInFolder(n)}}]',
  'return n==null?[]:[{label:J7,click:()=>{process.platform===`linux`?_codexLinuxRevealPath(n):a.shell.showItemInFolder(n)}}]',
);

source = replaceOnce(
  source,
  'linux system default opener',
  'async function _N(e){let{shell:t}=await import(`electron`),n=await t.openPath(e);if(n)throw Error(n)}',
  'async function _N(e){if(process.platform===`linux`)return await _codexLinuxOpenFileManager(e);let{shell:t}=await import(`electron`),n=await t.openPath(e);if(n)throw Error(n)}',
);

source = replaceOnce(
  source,
  'linux terminal target',
  'iM={id:`terminal`,platforms:{...aM({id:`terminal`,label:`Terminal`,icon:`apps/terminal.png`,appPaths:[`/System/Applications/Utilities/Terminal.app`],appName:`Terminal`}).platforms,win32:{label:`Terminal`,icon:`apps/microsoft-terminal.png`,kind:`terminal`,detect:fM,iconPath:()=>null,args:pM,open:({command:e,path:t})=>mM(e,pM(t))}}};',
  'iM={id:`terminal`,platforms:{...aM({id:`terminal`,label:`Terminal`,icon:`apps/terminal.png`,appPaths:[`/System/Applications/Utilities/Terminal.app`],appName:`Terminal`}).platforms,win32:{label:`Terminal`,icon:`apps/microsoft-terminal.png`,kind:`terminal`,detect:fM,iconPath:()=>null,args:pM,open:({command:e,path:t})=>mM(e,pM(t))},linux:{label:`Terminal`,icon:`apps/terminal.png`,kind:`terminal`,detect:_codexDetectLinuxTerminal,iconPath:()=>null,args:e=>[cM(e)],open:_codexOpenLinuxTerminal}}};',
);

source = replaceOnce(
  source,
  'linux terminal helpers',
  'function gM(){return oM(os)}',
  'function _codexDetectLinuxTerminal(){for(let e of[`gnome-terminal`,`kgx`,`konsole`,`tilix`,`alacritty`,`ghostty`,`wezterm`,`xterm`]){let t=os(e);if(t)return t}return null}async function _codexOpenLinuxTerminal({command:e,path:t}){let n=(0,s.basename)(e),r=cM(t);if(n===`gnome-terminal`||n===`kgx`||n===`tilix`)return await us(e,[`--working-directory`,r]);if(n===`konsole`)return await us(e,[`--workdir`,r]);if(n===`alacritty`||n===`ghostty`)return await us(e,[`--working-directory`,r]);if(n===`wezterm`)return await us(e,[`start`,`--cwd`,r]);await us(e,[])}function gM(){return oM(os)}',
);

source = replaceOnce(
  source,
  'linux vscode target',
  'var wN=Qj({id:`vscode`,label:`VS Code`,icon:`apps/vscode.png`,darwinDetect:()=>Uj([`/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`,`/Applications/Code.app/Contents/Resources/app/bin/code`]),win32Detect:TN});',
  'var wN=Qj({id:`vscode`,label:`VS Code`,icon:`apps/vscode.png`,darwinDetect:()=>Uj([`/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`,`/Applications/Code.app/Contents/Resources/app/bin/code`]),win32Detect:TN,linuxDetect:_codexDetectVSCodeLinux,linuxOpen:_codexOpenVSCodeLinux});',
);

source = replaceOnce(
  source,
  'linux vscode and ferrite helpers',
  'function TN(){return Cs({pathCommand:os(`code`),executableName:`Code.exe`,installDirName:`Microsoft VS Code`})}',
  'function TN(){return Cs({pathCommand:os(`code`),executableName:`Code.exe`,installDirName:`Microsoft VS Code`})}function _codexDetectFlatpak(e){let n=os(`flatpak`);if(!n)return null;try{return(0,f.spawnSync)(n,[`info`,e],{stdio:`ignore`,env:t.$r(process.env),timeout:1e3}).status===0?n:null}catch{return null}}function _codexDetectVSCodeLinux(){return os(`code`)??_codexDetectFlatpak(`com.visualstudio.code`)}async function _codexOpenVSCodeLinux({command:e,path:t,location:n,hostConfig:r,remoteWorkspaceRoot:i,remotePath:a}){let o=$j(t,n,r,i,a);return(0,s.basename)(e)===`flatpak`?await us(e,[`run`,`--command=code`,`com.visualstudio.code`,...o]):await us(e,o)}function _codexDetectFerriteLinux(){return os(`ferrite`)??_codexDetectFlatpak(`io.github.olaproeis.Ferrite`)}async function _codexOpenFerriteLinux({command:e,path:t}){return(0,s.basename)(e)===`flatpak`?await us(e,[`run`,`--file-forwarding`,`io.github.olaproeis.Ferrite`,`@@`,t,`@@`]):await us(e,[t])}',
);

source = replaceOnce(
  source,
  'linux ferrite target registry',
  'var GN=[wN,EN,SN,TM,nM,kM,fN,BN,kN,eM,RM,hN,AM,iM,FM,CM,jN,BM,PM,ON,FN,KM,qM,JM,YM,XM,ZM,QM,$M,vN];',
  'var _codexFerriteTarget=Zj({id:`ferrite`,label:`Ferrite`,icon:`apps/vscode.png`,kind:`editor`,linux:{detect:_codexDetectFerriteLinux,args:e=>[e],open:_codexOpenFerriteLinux}}),GN=[wN,EN,SN,TM,nM,kM,fN,BN,kN,eM,RM,hN,AM,iM,_codexFerriteTarget,FM,CM,jN,BM,PM,ON,FN,KM,qM,JM,YM,XM,ZM,QM,$M,vN];',
);

fs.writeFileSync(mainPath, source);
console.log(`wrote ${mainPath}`);

const workerPath = findBundle(appDir, 'worker.js');
let workerSource = fs.readFileSync(workerPath, 'utf8');

workerSource = replaceOnce(
  workerSource,
  'linux file manager target in worker',
  'fce=S9({id:`fileManager`,label:`Finder`,icon:`apps/finder.png`,kind:`fileManager`,darwin:{detect:()=>`open`,args:e=>q7(e)},win32:{label:`File Explorer`,icon:`apps/file-explorer.png`,detect:pce,args:e=>q7(e),open:async({path:e})=>mce(e)}});function pce',
  'fce=S9({id:`fileManager`,label:`Finder`,icon:`apps/finder.png`,kind:`fileManager`,darwin:{detect:()=>`open`,args:e=>q7(e)},win32:{label:`File Explorer`,icon:`apps/file-explorer.png`,detect:pce,args:e=>q7(e),open:async({path:e})=>mce(e)},linux:{label:`File Manager`,icon:`apps/finder.png`,detect:()=>`xdg-open`,args:e=>q7(e),open:async({path:e})=>mce(e)}});function pce',
);

workerSource = replaceOnce(
  workerSource,
  'linux-aware open target helper in worker',
  'function C9({id:e,label:t,icon:n,darwinDetect:r,win32Detect:i,darwinEnv:a,darwinArgs:o,hidden:s}){return{id:e,platforms:{darwin:r?{label:t,icon:n,kind:`editor`,hidden:s,detect:r,env:a,args:o??w9,supportsSsh:!0}:void 0,win32:i?{label:t,icon:n,kind:`editor`,hidden:s,detect:i,args:w9,supportsSsh:!0}:void 0}}}',
  'function C9({id:e,label:t,icon:n,darwinDetect:r,win32Detect:i,linuxDetect:l,linuxOpen:u,darwinEnv:a,darwinArgs:o,hidden:s}){return{id:e,platforms:{darwin:r?{label:t,icon:n,kind:`editor`,hidden:s,detect:r,env:a,args:o??w9,supportsSsh:!0}:void 0,win32:i?{label:t,icon:n,kind:`editor`,hidden:s,detect:i,args:w9,supportsSsh:!0}:void 0,linux:l?{label:t,icon:n,kind:`editor`,hidden:s,detect:l,args:w9,open:u,supportsSsh:!0}:void 0}}}',
);

workerSource = replaceOnceFromAny(
  workerSource,
  'linux file manager opener in worker',
  [
    'async function mce(e){let{shell:t}=await import(`electron`),n=hce(e);if(n&&(0,w.statSync)(n).isFile()){t.showItemInFolder(n);return}let r=n??e,i=await t.openPath(r);if(i)throw Error(i)}function hce',
    'async function mce(e){let{shell:t}=await import(`electron`),n=hce(e);if(process.platform===`linux`){let t=n??e;try{n&&(0,w.statSync)(n).isFile()&&(t=(0,E.dirname)(n))}catch{}await _codexLinuxOpenFileManager(t);return}if(n&&(0,w.statSync)(n).isFile()){t.showItemInFolder(n);return}let r=n??e,i=await t.openPath(r);if(i)throw Error(i)}async function _codexLinuxOpenFileManager(e){let{spawn:t}=await import(`node:child_process`),n=process.env.CODEX_LINUX_FILE_MANAGER?.trim()||`xdg-open`,r=t(n,[e],{detached:!0,stdio:`ignore`});r.on(`error`,()=>{}),r.unref()}function hce',
  ],
  'async function mce(e){let{shell:t}=await import(`electron`),n=hce(e);if(process.platform===`linux`){await _codexLinuxRevealPath(n??e);return}if(n&&(0,w.statSync)(n).isFile()){t.showItemInFolder(n);return}let r=n??e,i=await t.openPath(r);if(i)throw Error(i)}async function _codexLinuxOpenFileManager(e){let{spawn:t}=await import(`node:child_process`),n=process.env.CODEX_LINUX_FILE_MANAGER?.trim()||`xdg-open`,r=t(n,[e],{detached:!0,stdio:`ignore`});r.on(`error`,()=>{}),r.unref()}async function _codexLinuxRevealPath(e){let t=e;try{(0,w.statSync)(e).isFile()&&(t=(0,E.dirname)(e))}catch{}await _codexLinuxOpenFileManager(t)}function hce',
);

workerSource = replaceOnce(
  workerSource,
  'linux system default opener in worker',
  'async function z9(e){let{shell:t}=await import(`electron`),n=await t.openPath(e);if(n)throw Error(n)}',
  'async function z9(e){if(process.platform===`linux`)return await _codexLinuxOpenFileManager(e);let{shell:t}=await import(`electron`),n=await t.openPath(e);if(n)throw Error(n)}',
);

workerSource = replaceOnce(
  workerSource,
  'linux terminal target in worker',
  'qse={id:`terminal`,platforms:{...E9({id:`terminal`,label:`Terminal`,icon:`apps/terminal.png`,appPaths:[`/System/Applications/Utilities/Terminal.app`],appName:`Terminal`}).platforms,win32:{label:`Terminal`,icon:`apps/microsoft-terminal.png`,kind:`terminal`,detect:k9,iconPath:()=>null,args:A9,open:({command:e,path:t})=>j9(e,A9(t))}}};',
  'qse={id:`terminal`,platforms:{...E9({id:`terminal`,label:`Terminal`,icon:`apps/terminal.png`,appPaths:[`/System/Applications/Utilities/Terminal.app`],appName:`Terminal`}).platforms,win32:{label:`Terminal`,icon:`apps/microsoft-terminal.png`,kind:`terminal`,detect:k9,iconPath:()=>null,args:A9,open:({command:e,path:t})=>j9(e,A9(t))},linux:{label:`Terminal`,icon:`apps/terminal.png`,kind:`terminal`,detect:_codexDetectLinuxTerminal,iconPath:()=>null,args:e=>[D9(e)],open:_codexOpenLinuxTerminal}}};',
);

workerSource = replaceOnce(
  workerSource,
  'linux terminal helpers in worker',
  'function $se(){return Jse(K7)}',
  'function _codexDetectLinuxTerminal(){for(let e of[`gnome-terminal`,`kgx`,`konsole`,`tilix`,`alacritty`,`ghostty`,`wezterm`,`xterm`]){let t=K7(e);if(t)return t}return null}async function _codexOpenLinuxTerminal({command:e,path:t}){let n=(0,E.basename)(e),r=D9(t);if(n===`gnome-terminal`||n===`kgx`||n===`tilix`)return await J7(e,[`--working-directory`,r]);if(n===`konsole`)return await J7(e,[`--workdir`,r]);if(n===`alacritty`||n===`ghostty`)return await J7(e,[`--working-directory`,r]);if(n===`wezterm`)return await J7(e,[`start`,`--cwd`,r]);await J7(e,[])}function $se(){return Jse(K7)}',
);

workerSource = replaceOnce(
  workerSource,
  'linux vscode target in worker',
  'var $ce=C9({id:`vscode`,label:`VS Code`,icon:`apps/vscode.png`,darwinDetect:()=>e9([`/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`,`/Applications/Code.app/Contents/Resources/app/bin/code`]),win32Detect:ele});',
  'var $ce=C9({id:`vscode`,label:`VS Code`,icon:`apps/vscode.png`,darwinDetect:()=>e9([`/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`,`/Applications/Code.app/Contents/Resources/app/bin/code`]),win32Detect:ele,linuxDetect:_codexDetectVSCodeLinux,linuxOpen:_codexOpenVSCodeLinux});',
);

workerSource = replaceOnce(
  workerSource,
  'linux vscode and ferrite helpers in worker',
  'function ele(){return u9({pathCommand:K7(`code`),executableName:`Code.exe`,installDirName:`Microsoft VS Code`})}',
  'function ele(){return u9({pathCommand:K7(`code`),executableName:`Code.exe`,installDirName:`Microsoft VS Code`})}function _codexDetectFlatpak(e){let t=K7(`flatpak`);if(!t)return null;try{return(0,C.spawnSync)(t,[`info`,e],{stdio:`ignore`,env:yG(process.env),timeout:1e3}).status===0?t:null}catch{return null}}function _codexDetectVSCodeLinux(){return K7(`code`)??_codexDetectFlatpak(`com.visualstudio.code`)}async function _codexOpenVSCodeLinux({command:e,path:t,location:n,hostConfig:r,remoteWorkspaceRoot:i,remotePath:a}){let o=w9(t,n,r,i,a);return(0,E.basename)(e)===`flatpak`?await J7(e,[`run`,`--command=code`,`com.visualstudio.code`,...o]):await J7(e,o)}function _codexDetectFerriteLinux(){return K7(`ferrite`)??_codexDetectFlatpak(`io.github.olaproeis.Ferrite`)}async function _codexOpenFerriteLinux({command:e,path:t}){return(0,E.basename)(e)===`flatpak`?await J7(e,[`run`,`--file-forwarding`,`io.github.olaproeis.Ferrite`,`@@`,t,`@@`]):await J7(e,[t])}',
);

workerSource = replaceOnce(
  workerSource,
  'linux ferrite target registry in worker',
  'var gle=new Map([$ce,tle,Zce,cce,Kse,dce,Hce,dle,ile,Wse,bce,Gce,fce,qse,_ce,oce,ale,Sce,gce,rle,cle,Dce,Oce,kce,Ace,jce,Mce,Nce,Pce,qce].flatMap(e=>{let t=e.platforms[process.platform];return t==null?[]:[[e.id,{id:e.id,...t}]]}));',
  'var _codexFerriteTarget=S9({id:`ferrite`,label:`Ferrite`,icon:`apps/vscode.png`,kind:`editor`,linux:{detect:_codexDetectFerriteLinux,args:e=>[e],open:_codexOpenFerriteLinux}}),gle=new Map([$ce,tle,Zce,cce,Kse,dce,Hce,dle,ile,Wse,bce,Gce,fce,qse,_codexFerriteTarget,_ce,oce,ale,Sce,gce,rle,cle,Dce,Oce,kce,Ace,jce,Mce,Nce,Pce,qce].flatMap(e=>{let t=e.platforms[process.platform];return t==null?[]:[[e.id,{id:e.id,...t}]]}));',
);

fs.writeFileSync(workerPath, workerSource);
console.log(`wrote ${workerPath}`);
