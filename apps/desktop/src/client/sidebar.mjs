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
  if (collapsed) return h('aside', { className: 'shaco-sidebar shaco-rail', 'aria-label': 'Shaco Forge 导航', 'data-testid': 'shaco-sidebar' },
    h('button', { onClick: toggleSidebar, 'aria-label': '展开导航' }, '☰'),
    h('button', { onClick: shell.newChat, disabled: state.busy, 'aria-label': '新对话' }, '+'),
    h('button', { onClick: () => shell.settings(true), 'aria-label': '设置' }, '设置'))
  return h('aside', { className: 'shaco-sidebar', 'aria-label': 'Shaco Forge 导航', 'data-testid': 'shaco-sidebar' },
    h('button', { className: 'collapse-sidebar', onClick: toggleSidebar, 'aria-label': '折叠导航' }, '‹'),
    h('header', { className: 'brand' }, h('span', { className: 'brand-mark', 'aria-hidden': true }, 'S'), h('span', null, h('strong', null, 'Shaco Forge'), h('small', null, 'AI 开发工作空间'))),
    h('div', { className: 'sidebar-section' }, h('button', { className: 'nav-action', 'data-testid': 'new-chat', disabled: state.busy, onClick: shell.newChat }, '+ 新对话')),
    h('section', { className: 'sidebar-section project-directory', 'data-testid': 'project-directory', 'aria-label': '项目目录' },
      h('div', { className: 'directory-heading' }, h('h2', null, '项目目录'), h('button', { 'data-testid': 'open-project', disabled: state.busy, onClick: shell.openProject }, '打开项目…')),
      h('input', { type: 'search', placeholder: '搜索项目与对话', 'aria-label': '搜索项目与对话', value: state.search, onChange: event => shell.setSearch(event.target.value) }),
      projects.phase !== 'ready' || chats.phase !== 'ready' ? h('p', null, '正在读取项目与对话…') :
        groups.length === 0 ? h('p', null, query ? '无匹配结果' : '暂无项目，请打开项目。') :
          h('div', { role: 'tree', 'aria-label': '项目与对话' }, groups.map(({ project, items }) => {
            const expanded = !state.collapsed.includes(project.workspaceId)
            return h('div', { key: project.workspaceId, className: 'project-group' },
              h('div', { className: 'project-row' },
                h('button', { className: 'disclosure', 'aria-label': `${expanded ? '折叠' : '展开'} ${project.title}`, 'aria-expanded': expanded, onClick: () => shell.toggle(project.workspaceId) }, expanded ? '▾' : '▸'),
                h('button', { className: 'sidebar-row project-title', 'aria-pressed': state.selected === project.workspaceId, onClick: () => shell.select(project.workspaceId) }, project.title)),
              expanded && h('div', { role: 'group' }, items.map(item => h('button', { key: item.id, role: 'treeitem', className: 'sidebar-row chat-row', 'aria-selected': chats.current === item.id,
                disabled: state.busy, onClick: () => shell.openSession(project.workspaceId, item.id) }, h('span', { 'aria-hidden': true }, '▱'), item.blank ? '新对话' : item.displayTitle))),
              expanded && !items.length && h('p', null, '暂无对话'))
          }))),
    state.error && h('p', { className: 'shaco-error', role: 'alert' }, state.error),
    h('button', { className: 'settings-entry', 'data-testid': 'settings', onClick: () => shell.settings(true) }, '设置'))
}
