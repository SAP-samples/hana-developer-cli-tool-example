<script setup lang="ts">
import { ref } from 'vue'
import { useNotifications } from '../composables/useNotifications'

import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Popover.js'
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/ListItemStandard.js'

const { notifications, unreadCount, dismiss, markAllRead, clearAll } = useNotifications()
const popoverOpen = ref(false)
const popoverRef = ref<HTMLElement | null>(null)

function togglePopover(e: Event) {
  const btn = e.target as HTMLElement
  if (popoverRef.value) {
    ;(popoverRef.value as any).opener = btn
    popoverOpen.value = !popoverOpen.value
  }
  if (popoverOpen.value) markAllRead()
}

function typeIcon(type: string): string {
  switch (type) {
    case 'success': return 'message-success'
    case 'error': return 'message-error'
    case 'warning': return 'message-warning'
    default: return 'message-information'
  }
}

function typeState(type: string): string {
  switch (type) {
    case 'success': return 'Success'
    case 'error': return 'Critical'
    case 'warning': return 'Warning'
    default: return 'Information'
  }
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}
</script>

<template>
  <ui5-button
    icon="bell"
    :tooltip="`Notifications (${unreadCount} unread)`"
    design="Transparent"
    id="notificationBtn"
    @click="togglePopover"
    class="notification-btn"
  >
    <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
  </ui5-button>

  <ui5-popover
    ref="popoverRef"
    opener="notificationBtn"
    :open="popoverOpen"
    placement="Bottom"
    class="notification-popover"
    @close="popoverOpen = false"
  >
    <div class="notification-header">
      <span class="notification-title">Notifications</span>
      <div class="notification-actions">
        <ui5-button design="Transparent" icon="decline" tooltip="Clear All" @click="clearAll" />
      </div>
    </div>

    <div class="notification-list" v-if="notifications.length > 0">
      <div
        v-for="n in notifications.slice(0, 30)"
        :key="n.id"
        class="notification-item"
        :class="[`type-${n.type}`, { unread: !n.read }]"
      >
        <ui5-icon :name="typeIcon(n.type)" class="notification-icon" :class="`icon-${n.type}`" />
        <div class="notification-content">
          <span class="notification-item-title">{{ n.title }}</span>
          <span v-if="n.message" class="notification-message">{{ n.message }}</span>
          <span class="notification-time">{{ relativeTime(n.timestamp) }}</span>
        </div>
        <ui5-button
          design="Transparent"
          icon="decline"
          tooltip="Dismiss"
          class="dismiss-btn"
          @click.stop="dismiss(n.id)"
        />
      </div>
    </div>

    <div v-else class="notification-empty">
      No notifications
    </div>
  </ui5-popover>
</template>

<style scoped>
.notification-btn {
  position: relative;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--sapNegativeColor, #bb0000);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  pointer-events: none;
}

.notification-popover {
  width: 360px;
  max-height: 480px;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0.5rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
}

.notification-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--sapTextColor);
}

.notification-list {
  max-height: 380px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--sapGroup_ContentBorderColor, #d9d9d9);
  transition: background-color 0.15s;
}

.notification-item:hover {
  background: var(--sapList_Hover_Background, #e5f0fa);
}

.notification-item.unread {
  background: var(--sapInfobar_Background, #f0f6ff);
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.icon-success { color: var(--sapPositiveColor, #2b7c2b); }
.icon-error { color: var(--sapNegativeColor, #bb0000); }
.icon-warning { color: var(--sapCriticalColor, #e76500); }
.icon-info { color: var(--sapInformativeColor, #0854a0); }

.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-item-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--sapTextColor);
}

.notification-message {
  font-size: 0.75rem;
  color: var(--sapContent_LabelColor);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 0.6875rem;
  color: var(--sapContent_LabelColor);
}

.dismiss-btn {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.notification-item:hover .dismiss-btn {
  opacity: 1;
}

.notification-empty {
  padding: 2rem;
  text-align: center;
  color: var(--sapContent_LabelColor);
  font-size: 0.8125rem;
}
</style>
