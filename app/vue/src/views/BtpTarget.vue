<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHanaApi } from '../composables/useHanaApi'
import { toast } from '../composables/useToast'

import '@ui5/webcomponents/dist/Title.js'
import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/MessageStrip.js'
import '@ui5/webcomponents/dist/Tree.js'
import '@ui5/webcomponents/dist/TreeItem.js'
import '@ui5/webcomponents/dist/Panel.js'

const { fetchDirect } = useHanaApi()

const loading = ref(false)
const error = ref('')
const success = ref('')
const globalAccount = ref<any>(null)
const hierarchy = ref<any>(null)
const currentTarget = ref('')

interface TreeNode {
  displayName: string
  guid?: string
  type: string
  children?: TreeNode[]
}

async function loadHierarchy() {
  loading.value = true
  error.value = ''

  try {
    const result = await fetchDirect<any>('/hana/btp-ui')
    globalAccount.value = result.globalAccount || null
    hierarchy.value = result.hierarchy || null
    currentTarget.value = result.currentTarget || ''
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function setTarget(guid: string) {
  error.value = ''
  success.value = ''

  try {
    const res = await fetch('/hana/btp-ui/setTarget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subaccount: guid })
    })
    const result = await res.json()
    if (result.success) {
      success.value = `Target set to: ${guid}`
      currentTarget.value = guid
      toast.show(`Target set to ${guid}`)
      await loadHierarchy()
    } else {
      error.value = result.message || 'Failed to set target'
    }
  } catch (e: any) {
    error.value = e.message
  }
}

function flattenHierarchy(node: any): TreeNode[] {
  if (!node) return []
  const items: TreeNode[] = []

  if (node.subaccounts) {
    for (const sa of node.subaccounts) {
      items.push({
        displayName: sa.displayName || sa.guid,
        guid: sa.guid,
        type: 'subaccount'
      })
    }
  }

  if (node.directories) {
    for (const dir of node.directories) {
      items.push({
        displayName: dir.displayName || dir.guid,
        type: 'directory',
        children: flattenHierarchy(dir)
      })
    }
  }

  return items
}

function onTreeItemClick(e: Event) {
  const detail = (e as CustomEvent).detail
  const item = detail?.item
  const guid = item?.dataset?.guid
  if (guid) {
    setTarget(guid)
  }
}

onMounted(loadHierarchy)
</script>

<template>
  <div class="btp-target-view">
    <ui5-title level="H3">BTP Subaccount Target</ui5-title>

    <ui5-message-strip v-if="currentTarget" design="Information" hide-close-button>
      Current target: {{ currentTarget }}
    </ui5-message-strip>

    <ui5-busy-indicator v-if="loading" active size="Medium" class="loading" />

    <div v-else-if="error" class="error">
      <ui5-message-strip design="Negative" hide-close-button>{{ error }}</ui5-message-strip>
    </div>

    <div v-else-if="success" class="success">
      <ui5-message-strip design="Positive" hide-close-button>{{ success }}</ui5-message-strip>
    </div>

    <template v-if="hierarchy">
      <ui5-panel
        :header-text="globalAccount?.displayName || 'Global Account'"
        accessible-role="Region"
      >
        <ui5-tree @item-click="onTreeItemClick">
          <template v-for="node in flattenHierarchy(hierarchy)" :key="node.displayName">
            <ui5-tree-item
              v-if="node.type === 'subaccount'"
              :text="node.displayName"
              icon="it-system"
              :data-guid="node.guid"
              :additional-text="node.guid === currentTarget ? '(current)' : ''"
            />
            <ui5-tree-item
              v-else
              :text="node.displayName"
              icon="open-folder"
              :has-children="(node.children?.length ?? 0) > 0"
            >
              <ui5-tree-item
                v-for="child in node.children"
                :key="child.displayName"
                :text="child.displayName"
                :icon="child.type === 'subaccount' ? 'it-system' : 'open-folder'"
                :data-guid="child.guid"
                :additional-text="child.guid === currentTarget ? '(current)' : ''"
              />
            </ui5-tree-item>
          </template>
        </ui5-tree>
      </ui5-panel>
    </template>

    <ui5-button
      design="Transparent"
      icon="refresh"
      @click="loadHierarchy"
    >Refresh</ui5-button>
  </div>
</template>

<style scoped>
.btp-target-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.error, .success {
  padding: 0.5rem 0;
}
</style>
