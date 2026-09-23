import { createElement as h, useEffect, useRef, useState, useSyncExternalStore } from 'react'

// Theme assets and unmatched presentation glyphs; accessible names remain on the real controls.
const iconPaths = {
  add: 'M12 5v14 M5 12h14',
  search: 'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  rename: 'M4 16v4h4L20 8l-4-4z M13 7l4 4',
  archive: 'M3 4h18v4H3z M5 8v12h14V8 M9 12h6',
  remove: 'M4 6h16 M9 3h6 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',
}
const icon = name => ['folder', 'project', 'settings'].includes(name)
  ? h('span', { className: `famicom-only action-icon theme-icon icon-${name === 'project' ? 'folder' : name}`, 'aria-hidden': true })
  : h('svg', { className: 'famicom-only action-icon', viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: iconPaths[name] }))
const actionLabel = (name, label) => [icon(name), h('span', { className: 'action-label' }, label)]

const useSource = source => useSyncExternalStore(listener => source.subscribe(listener), () => source.getSnapshot(), () => source.getSnapshot())
export function Sidebar({ shell, workspaces, sessions, collapsed, toggleSidebar }) {
  const state = useSource(shell)
  const projects = useSource(workspaces)
  const chats = useSource(sessions)
  const [openProjectMenu, setOpenProjectMenu] = useState(null)
  const searchInput = useRef(null), focusSearch = useRef(false)
  useEffect(() => {
    if (!collapsed && focusSearch.current) { searchInput.current?.focus(); focusSearch.current = false }
  }, [collapsed])
  useEffect(() => {
    if (!openProjectMenu) return undefined
    const closeOutside = event => { if (!event.target.closest?.('[data-project-menu]')) setOpenProjectMenu(null) }
    const closeOnEscape = event => { if (event.key === 'Escape') setOpenProjectMenu(null) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape) }
  }, [openProjectMenu])
  const query = state.search.trim().toLocaleLowerCase()
  const groups = projects.items.map(project => ({ project, items: project.sessionIds.map(id => chats.byId[id]).filter(item => item && !projects.archivedSessionIds.includes(item.id) && (!item.blank || chats.current === item.id)) }))
    .map(({ project, items }) => ({ project, items: project.title.toLocaleLowerCase().includes(query) ? items : items.filter(item => item.displayTitle.toLocaleLowerCase().includes(query)) }))
    .filter(({ project, items }) => !query || project.title.toLocaleLowerCase().includes(query) || items.length)
  if (collapsed) return h('aside', { className: 'shaco-sidebar shaco-rail', 'aria-label': 'Shaco Forge 导航', 'data-testid': 'shaco-sidebar' },
    h('button', { className: 'brand-expand', onClick: toggleSidebar, 'aria-label': '展开侧栏', title: '展开侧栏', 'aria-expanded': false }, h('span', { className: 'brand-mark', 'aria-hidden': true }, 'S'), h('span', { className: 'expand-glyph', 'aria-hidden': true }, '☰')),
    h('div', { className: 'rail-group rail-primary' },
      h('button', { onClick: shell.newChat, disabled: state.busy, 'aria-label': '新对话', title: '新对话', 'data-testid': 'new-chat' }, h('span', { className: 'theme-icon icon-chat', 'aria-hidden': true }))),
    h('div', { className: 'rail-group rail-projects' },
      h('button', { onClick: shell.openProject, disabled: state.busy, 'aria-label': '打开项目', title: '打开项目', 'data-testid': 'open-project' }, icon('project')),
      h('button', { onClick: () => { focusSearch.current = true; toggleSidebar() }, 'aria-label': '搜索项目与对话', title: '搜索项目与对话' }, h('span', { className: 'theme-icon icon-search', 'aria-hidden': true }))),
    h('button', { className: 'rail-settings', onClick: () => shell.settings(true), 'aria-label': '设置', title: '设置', 'data-testid': 'settings' }, ...actionLabel('settings', '设置')))
  const tree = projects.phase !== 'ready' || chats.phase !== 'ready'
    ? h('p', null, '正在读取项目与对话…')
    : groups.length === 0
      ? h('p', null, query ? '无匹配结果' : '暂无项目，请打开项目。')
      : h('div', { role: 'tree', 'aria-label': '项目与对话' }, groups.map(({ project, items }) => {
        const expanded = !state.collapsed.includes(project.workspaceId)
        const rows = items.map(item => h('div', { key: item.id, className: 'chat-management-row' },
          h('button', { role: 'treeitem', className: 'sidebar-row chat-row', 'aria-selected': chats.current === item.id,
            disabled: state.busy, onClick: () => shell.openSession(project.workspaceId, item.id) }, h('span', { className: 'theme-icon icon-chat', 'aria-hidden': true }), item.blank ? '新对话' : item.displayTitle),
          !item.blank && h('button', { className: 'row-action', 'aria-label': `重命名对话 ${item.displayTitle}`, title: '重命名对话', disabled: state.busy, onClick: () => shell.manageSession('rename-session', project.workspaceId, item.id) }, ...actionLabel('rename', '重命名')),
          !item.blank && h('button', { className: 'row-action', 'aria-label': `归档对话 ${item.displayTitle}`, title: '归档对话', disabled: state.busy, onClick: () => shell.manageSession('archive-session', project.workspaceId, item.id) }, ...actionLabel('archive', '归档'))))
        return h('div', { key: project.workspaceId, className: 'project-group' },
          h('div', { className: 'project-row' },
            h('button', { className: 'disclosure', 'aria-label': `${expanded ? '折叠' : '展开'} ${project.title}`, 'aria-expanded': expanded, onClick: () => shell.toggle(project.workspaceId) }, expanded ? '▾' : '▸'),
            h('button', { role: 'treeitem', className: 'sidebar-row project-title', 'aria-label': `${expanded ? '折叠' : '展开'} ${project.title}`, 'aria-expanded': expanded,
              onClick: () => shell.toggle(project.workspaceId) }, icon('folder'), project.title),
            h('div', { className: 'project-row-actions' },
              h('button', { className: 'row-action project-new-chat', 'aria-label': `在 ${project.title} 中新建对话`, title: '在此项目中新建对话', disabled: state.busy,
                onClick: () => { setOpenProjectMenu(null); void shell.newChatIn(project.workspaceId) } }, ...actionLabel('add', '新建对话')),
              h('div', { className: 'project-menu', 'data-project-menu': '' },
                h('button', { className: 'row-action project-menu-trigger', 'aria-label': `更多项目操作 ${project.title}`, title: '更多项目操作', disabled: state.busy,
                  'aria-haspopup': 'menu', 'aria-expanded': openProjectMenu === project.workspaceId, onClick: () => setOpenProjectMenu(current => current === project.workspaceId ? null : project.workspaceId) }, '…'),
                openProjectMenu === project.workspaceId && h('div', { className: 'project-actions-menu', role: 'menu', 'aria-label': `${project.title} 项目操作` },
                  h('button', { role: 'menuitem', disabled: state.busy, onClick: () => { setOpenProjectMenu(null); shell.manageWorkspace('rename-workspace', project.workspaceId) } }, ...actionLabel('rename', '重命名')),
                  h('button', { role: 'menuitem', className: 'danger', disabled: state.busy, onClick: () => { setOpenProjectMenu(null); shell.manageWorkspace('remove-workspace', project.workspaceId) } }, ...actionLabel('remove', '删除'))))),
          ),
          expanded && h('div', { role: 'group' }, rows), expanded && !items.length && h('p', null, '暂无对话'))
      }))
  const directory = h('section', { className: 'sidebar-section project-directory', 'data-testid': 'project-directory', 'aria-label': '项目目录' },
    h('div', { className: 'directory-heading' }, h('h2', null, h('span', { className: 'action-label' }, '项目目录'), h('span', { className: 'famicom-only' }, '项目')), h('button', { className: 'project-add', 'data-testid': 'open-project', 'aria-label': '打开项目', title: '打开项目', disabled: state.busy, onClick: shell.openProject }, ...actionLabel('add', '打开项目…'))),
    h('input', { ref: searchInput, type: 'search', placeholder: '搜索项目与对话', 'aria-label': '搜索项目与对话', value: state.search, onChange: event => shell.setSearch(event.target.value) }),
    tree, state.dialog && h(ManagementDialog, { state, shell }))
  return h('aside', { className: 'shaco-sidebar', 'aria-label': 'Shaco Forge 导航', 'data-testid': 'shaco-sidebar' },
    h('header', { className: 'brand' }, h('span', { className: 'brand-mark', 'aria-hidden': true }, 'S'), h('span', null, h('strong', null, 'Shaco Forge'), h('small', null, 'AI 开发工作空间')),
      h('button', { className: 'collapse-sidebar', onClick: toggleSidebar, 'aria-label': '收起侧栏', title: '收起侧栏', 'aria-expanded': true },
        h('span', { className: 'theme-icon icon-sidebar', 'aria-hidden': true }))),
    h('div', { className: 'sidebar-section' }, h('h2', { className: 'famicom-only function-heading' }, '功能'), h('button', { className: 'nav-action', 'data-testid': 'new-chat', disabled: state.busy, onClick: shell.newChat }, '+ 新对话')),
    directory,
    state.error && h('p', { className: 'shaco-error', role: 'alert' }, state.error),
    h('button', { className: 'settings-entry', 'data-testid': 'settings', onClick: () => shell.settings(true) }, ...actionLabel('settings', '设置')))
}

const REMOVE_COPY = '只会从 Shaco Forge 的项目列表移除此项目。不会删除项目目录、其中的文件或任何会话记录。移除后旧会话将不再归入项目；以后重新添加同一目录会创建一个空项目分组，不会自动恢复旧分组。'

function ManagementDialog({ state, shell }) {
  const dialog = state.dialog
  const rename = dialog.kind === 'rename-workspace' || dialog.kind === 'rename-session'
  const title = dialog.kind === 'rename-workspace' ? '重命名项目' : dialog.kind === 'remove-workspace' ? '安全移除项目' : dialog.kind === 'rename-session' ? '重命名对话' : '归档对话'
  return h('section', { className: 'shaco-confirmation management-dialog', role: 'dialog', 'aria-modal': true, 'aria-label': title },
    h('h3', null, title), dialog.kind === 'remove-workspace' && h('p', null, REMOVE_COPY),
    dialog.kind === 'archive-session' && h('p', null, '归档后，对话会从 Shaco Forge 的对话列表中消失；会话记录不会删除。'),
    rename && h('label', null, '名称', h('input', { autoFocus: true, value: dialog.title, disabled: state.busy, onChange: event => shell.setDialogTitle(event.target.value) })),
    state.error && h('p', { className: 'shaco-error', role: 'alert' }, state.error),
    h('div', { className: 'management-actions' }, h('button', { disabled: state.busy, onClick: shell.closeDialog }, '取消'),
      h('button', { className: 'primary', disabled: state.busy, onClick: shell.submitDialog }, state.busy ? '处理中…' : rename ? '保存' : '确认')))
}
