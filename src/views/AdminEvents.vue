<script setup>
import { ref, reactive } from 'vue'
import { useAdminStore } from '../stores/adminStore'

const admin = useAdminStore()

const showForm = ref(false)
const editingId = ref(null)

const emptyForm = {
  name: '',
  type: 'REGISTER',
  amountType: 'FIXED',
  amountValue: 100,
  wagerMultiplier: 10,
  expiryHours: 72,
  scope: ['ALL'],
  maxGrant: 500,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
}

const form = reactive({ ...emptyForm })

const bonusTypes = [
  { value: 'REGISTER', label: '註冊禮金' },
  { value: 'DEPOSIT', label: '儲值加碼' },
  { value: 'DAILY_CHECK', label: '每日簽到' },
  { value: 'VIP_REBATE', label: 'VIP 回饋' },
  { value: 'PROMO', label: '活動推廣' },
]

const scopeOptions = ['ALL', 'FISHING', 'SLOT', 'LIVE', 'SPORT']

function openCreate() {
  Object.assign(form, { ...emptyForm })
  editingId.value = null
  showForm.value = true
}

function openEdit(evt) {
  Object.assign(form, {
    name: evt.name,
    type: evt.type,
    amountType: evt.amountType,
    amountValue: evt.amountValue,
    wagerMultiplier: evt.wagerMultiplier,
    expiryHours: evt.expiryHours,
    scope: [...evt.scope],
    maxGrant: evt.maxGrant,
    startDate: evt.startDate,
    endDate: evt.endDate,
  })
  editingId.value = evt.id
  showForm.value = true
}

function saveForm() {
  if (editingId.value) {
    admin.updateEvent(editingId.value, { ...form })
  } else {
    admin.addEvent({ ...form })
  }
  showForm.value = false
}

function toggleScope(s) {
  const idx = form.scope.indexOf(s)
  if (idx === -1) {
    if (s === 'ALL') {
      form.scope = ['ALL']
    } else {
      form.scope = form.scope.filter((x) => x !== 'ALL')
      form.scope.push(s)
    }
  } else {
    form.scope.splice(idx, 1)
    if (form.scope.length === 0) form.scope = ['ALL']
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">活動配置</h1>
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        @click="openCreate"
      >
        + 新增活動
      </button>
    </div>

    <!-- Event Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-500">活動名稱</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">類型</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">金額</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">流水倍數</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">過期</th>
            <th class="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
            <th class="text-right px-4 py-3 font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="evt in admin.events"
            :key="evt.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-medium text-gray-800">{{ evt.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ evt.type }}</td>
            <td class="px-4 py-3 text-gray-600">
              {{ evt.amountType === 'FIXED' ? `$${evt.amountValue}` : `${evt.amountValue}%` }}
              <span v-if="evt.maxGrant" class="text-xs text-gray-400 ml-1">
                (上限 ${{ evt.maxGrant }})
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ evt.wagerMultiplier }}x</td>
            <td class="px-4 py-3 text-gray-600">{{ evt.expiryHours }}h</td>
            <td class="px-4 py-3">
              <button
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="evt.enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'"
                @click="admin.toggleEvent(evt.id)"
              >
                {{ evt.enabled ? '啟用中' : '已停用' }}
              </button>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button
                class="text-blue-500 hover:text-blue-700 text-xs"
                @click="openEdit(evt)"
              >
                編輯
              </button>
              <button
                class="text-red-500 hover:text-red-700 text-xs"
                @click="admin.deleteEvent(evt.id)"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="showForm = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-gray-800">
            {{ editingId ? '編輯活動' : '新增活動' }}
          </h2>

          <!-- Name -->
          <div>
            <label class="text-sm text-gray-500 block mb-1">活動名稱</label>
            <input
              v-model="form.name"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例：新手註冊禮金"
            />
          </div>

          <!-- Type -->
          <div>
            <label class="text-sm text-gray-500 block mb-1">Bonus 類型</label>
            <select
              v-model="form.type"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option v-for="t in bonusTypes" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <!-- Amount -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-500 block mb-1">發放方式</label>
              <select
                v-model="form.amountType"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="FIXED">固定金額</option>
                <option value="PERCENT">百分比</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-500 block mb-1">
                {{ form.amountType === 'FIXED' ? '金額' : '百分比 (%)' }}
              </label>
              <input
                v-model.number="form.amountValue"
                type="number"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <!-- Wager & Expiry -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-500 block mb-1">流水倍數</label>
              <input
                v-model.number="form.wagerMultiplier"
                type="number"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label class="text-sm text-gray-500 block mb-1">過期時數</label>
              <input
                v-model.number="form.expiryHours"
                type="number"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <!-- Max Grant -->
          <div>
            <label class="text-sm text-gray-500 block mb-1">最大發放上限</label>
            <input
              v-model.number="form.maxGrant"
              type="number"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Scope -->
          <div>
            <label class="text-sm text-gray-500 block mb-1">適用範圍</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="s in scopeOptions"
                :key="s"
                class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                :class="form.scope.includes(s)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                @click="toggleScope(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Period -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-500 block mb-1">開始日期</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label class="text-sm text-gray-500 block mb-1">結束日期</label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="showForm = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              @click="saveForm"
            >
              {{ editingId ? '儲存' : '建立' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
