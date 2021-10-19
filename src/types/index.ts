
export interface IJsonEditWin {
    showWin: ({ nodePath, nodeVal }: Record<string, string>) => void
}

export interface IJsonAddWin {
    showWin: ({ nodePath }: { nodePath: string; }) => void
}

export interface PatchActionEventData {
    event: 'patch-remove' | 'patch-add' | 'patch-edit'
    nodeData: { content: string; path: string; }
}
