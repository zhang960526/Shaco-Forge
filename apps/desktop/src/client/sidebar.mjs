import { createElement as h, useSyncExternalStore } from 'react'

const useSource = source => useSyncExternalStore(listener => source.subscribe(listener), () => source.getSnapshot(), () => source.getSnapshot())
export function Sidebar({ shell, workspaces, sessions, collapsed, toggleSidebar }) {
  const state = useSource(shell)
  const projects = useSource(workspaces)
  const chats = useSource(sessions)
  const query = state.search.trim().toLocaleLowerCase()
  const groups = projects.items.map(project => ({ project, items: project.sessionIds.map(id => chats.byId[id]).filter(item => item && !projects.archivedSessionIds.includes(item.id)) }))
    .map(({ project, items }) => ({ project, items: project.title.toLocaleLowerCase().includes(query) ? items : items.filter(item => item.displayTitle.toLocaleLowerCase().includes(query)) }))
    .filter(({ project, items }) => !query || project.title.toLocaleLowerCase().includes(query) || items.length)
  const archived = projects.archivedSessionIds.map(id => chats.byId[id]).filter(item => item && (!query || item.displayTitle.toLocaleLowerCase().includes(query)))
  const archivedWorkspace = id => projects.items.find(project => project.sessionIds.includes(id))
  if (collapsed) return h('aside', { className: 'shaco-sidebar shaco-rail', 'aria-label': 'Shaco Forge 导航', 'data-testid': 'shaco-sidebar' },
    h('button', { onClick: toggleSidebar, 'aria-label': '展开导航' }, '☰'),
    h('button', { onClick: shell.newChat, disabled: state.busy, 'aria-label': '新对话' }, '+'),
    h('button', { onClick: () => shell.settings(true), 'aria-label': '设置' }, '设置'))
  const tree = projects.phase !== 'ready' || chats.phase !== 'ready'
    ? h('p', null, '正在读取项目与对话…')
    : groups.length === 0
      ? h('p', null, query ? '无匹配结果' : '暂无项目，请打开项目。')
      : h('div', { role: 'tree', 'aria-label': '项目与对话' }, groups.map(({ project, items }) => {
        const expanded = !state.collapsed.includes(project.workspaceId)
        const rows = items.map(item => h('div', { key: item.id, className: 'chat-management-row' },
          h('button', { role: 'treeitem', className: 'sidebar-row chat-row', 'aria-selected': chats.current === item.id,
            disabled: state.busy, onClick: () => shell.openSession(project.workspaceId, item.id) }, h('span', { 'aria-hidden': true }, '▱'), item.blank ? '新对话' : item.displayTitle),
          h('button', { className: 'row-action', 'aria-label': `重命名对话 ${item.displayTitle}`, disabled: state.busy, onClick: () => shell.manageSession('rename-session', project.workspaceId, item.id) }, '重命名'),
          h('button', { className: 'row-action', 'aria-label': `归档对话 ${item.displayTitle}`, disabled: state.busy, onClick: () => shell.manageSession('archive-session', project.workspaceId, item.id) }, '归档')))
        return h('div', { key: project.workspaceId, className: 'project-group' },
          h('div', { className: 'project-row' },
            h('button', { className: 'disclosure', 'aria-label': `${expanded ? '折叠' : '展开'} ${project.title}`, 'aria-expanded': expanded, onClick: () => shell.toggle(project.workspaceId) }, expanded ? '▾' : '▸'),
            h('button', { className: 'sidebar-row project-title', 'aria-pressed': state.selected === project.workspaceId, onClick: () => shell.select(project.workspaceId) }, project.title),
            h('button', { className: 'row-action', 'aria-label': `重命名项目 ${project.title}`, disabled: state.busy, onClick: () => shell.manageWorkspace('rename-workspace', project.workspaceId) }, '重命名'),
            h('button', { className: 'row-action', 'aria-label': `移除项目 ${project.title}`, disabled: state.busy, onClick: () => shell.manageWorkspace('remove-workspace', project.workspaceId) }, '移除')),
          expanded && h('div', { role: 'group' }, rows), expanded && !items.length && h('p', null, '暂无对话'))
      }))
  const archiveSection = projects.phase === 'ready' && chats.phase === 'ready' && h('section', { className: 'archived-sessions', 'aria-label': '已归档' },
    h('h2', null, '已归档'), archived.length === 0 ? h('p', null, query ? '无匹配的归档对话' : '暂无归档对话') : archived.map(item => {
      const workspace = archivedWorkspace(item.id)
      return h('div', { key: item.id, className: 'archived-row' },
        h('button', { className: 'sidebar-row', disabled: state.busy, onClick: () => shell.openArchivedSession(item.id) }, item.blank ? '新对话' : item.displayTitle),
        h('small', null, workspace?.title ?? '未分组'))
    }))
  const directory = h('section', { className: 'sidebar-section project-directory', 'data-testid': 'project-directory', 'aria-label': '项目目录' },
    h('div', { className: 'directory-heading' }, h('h2', null, '项目目录'), h('button', { 'data-testid': 'open-project', disabled: state.busy, onClick: shell.openProject }, '打开项目…')),
    h('input', { type: 'search', placeholder: '搜索项目与对话', 'aria-label': '搜索项目与对话', value: state.search, onChange: event => shell.setSearch(event.target.value) }),
    tree, archiveSection, state.dialog && h(ManagementDialog, { state, shell }))
  return h('aside', { className: 'shaco-sidebar', 'aria-label': 'Shaco Forge 导航', 'data-testid': 'shaco-sidebar' },
    h('button', { className: 'collapse-sidebar', onClick: toggleSidebar, 'aria-label': '折叠导航' }, '‹'),
    h('header', { className: 'brand' }, h('span', { className: 'brand-mark', 'aria-hidden': true }, 'S'), h('span', null, h('strong', null, 'Shaco Forge'), h('small', null, 'AI 开发工作空间'))),
    h('div', { className: 'sidebar-section' }, h('button', { className: 'nav-action', 'data-testid': 'new-chat', disabled: state.busy, onClick: shell.newChat }, '+ 新对话')),
    directory,
    state.error && h('p', { className: 'shaco-error', role: 'alert' }, state.error),
    h('button', { className: 'settings-entry', 'data-testid': 'settings', onClick: () => shell.settings(true) }, '设置'))
}

const REMOVE_COPY = '只会从 Shaco Forge 的项目列表移除此项目。不会删除项目目录、其中的文件或任何会话记录。移除后旧会话将不再归入项目；以后重新添加同一目录会创建一个空项目分组，不会自动恢复旧分组。'

function ManagementDialog({ state, shell }) {
  const dialog = state.dialog
  const rename = dialog.kind === 'rename-workspace' || dialog.kind === 'rename-session'
  const title = dialog.kind === 'rename-workspace' ? '重命名项目' : dialog.kind === 'remove-workspace' ? '安全移除项目' : dialog.kind === 'rename-session' ? '重命名对话' : '归档对话'
  return h('section', { className: 'shaco-confirmation management-dialog', role: 'dialog', 'aria-modal': true, 'aria-label': title },
    h('h3', null, title), dialog.kind === 'remove-workspace' && h('p', null, REMOVE_COPY),
    dialog.kind === 'archive-session' && h('p', null, '归档后，对话会从项目主列表移到“已归档”；会话记录不会删除。'),
    rename && h('label', null, '名称', h('input', { autoFocus: true, value: dialog.title, disabled: state.busy, onChange: event => shell.setDialogTitle(event.target.value) })),
    state.error && h('p', { className: 'shaco-error', role: 'alert' }, state.error),
    h('div', { className: 'management-actions' }, h('button', { disabled: state.busy, onClick: shell.closeDialog }, '取消'),
      h('button', { className: 'primary', disabled: state.busy, onClick: shell.submitDialog }, state.busy ? '处理中…' : rename ? '保存' : '确认')))
}
