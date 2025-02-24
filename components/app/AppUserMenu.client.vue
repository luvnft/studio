<template>
  <div v-if="connected" class="d-flex align-center">
    <v-menu v-model="menu" :close-on-content-click="false">
      <template #activator="{ props }">
        <v-list width="210" :style="{ cursor: 'pointer' }" v-bind="props" bg-color="transparent" variant="text"
          density="comfortable" rounded="pill">
          <v-list-item :prepend-avatar="avatar" :title="name" :subtitle="formattedBalance" />
        </v-list>
      </template>

      <v-card min-width="300">
        <div class="py-3 text-center flex-grow-1">
          <v-avatar size="80" :style="{ cursor: 'pointer' }" @click.stop="navigateTo('/me')">
            <v-img :src="avatar" :alt="accountName" cover />
          </v-avatar>
          <v-card-title :style="{ cursor: 'pointer' }" @click.stop="navigateTo('/me')">
            {{ name }}
          </v-card-title>
          <v-card-subtitle :style="{ marginTop: '-6px' }">
            {{ accountName }}
          </v-card-subtitle>
          <v-card-subtitle v-if="user?.username">
            {{ formatShortAddress(address, 6) }}
          </v-card-subtitle>
          <v-btn icon="mdi-refresh" :loading="loading" size="small" variant="text" rounded="pill" color="grey-lighten-1"
            @click.stop="fetchBalance" />
          <AppCopyBtn v-if="address" :text="address" />
        </div>
        <v-divider />
        <v-list density="comfortable">
          <v-list-item append-icon="mdi-account" to="/me">
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="canUpload" append-icon="mdi-music" to="/me/tracks">
            <v-list-item-title>My Tracks</v-list-item-title>
          </v-list-item>
          <v-list-item append-icon="mdi-bank" to="/me/assets">
            <v-list-item-title>My Assets</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-btn prepend-icon="mdi-logout" block rounded="pill" variant="outlined" color="primary"
            @click.stop="disconnect">Disconnect</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import defaultImage from "@/assets/images/default.png";

const { address, accountName } = useChain("bitsong")
const { disconnect, connected } = useConnect();

const menu = ref(false);
const user = await useUser();
const { formattedBalance, loading, fetchBalance: _fecthBalance } = useUserBalance();

useWalletEvents("keystorechange", () => {
  disconnect()
});

async function fetchBalance() {
  await _fecthBalance(address)
}

watch(connected, async (val) => {
  if (val) {
    await fetchBalance()
  }
})

const avatar = computed(() => {
  if (user.value?.avatar) return useIpfsLink(user.value.avatar)
  return defaultImage
})

const name = computed(() => {
  if (user.value?.username) return user.value.username
  return formatShortAddress(toValue(address), 6)
})


onMounted(async () => {
  if (connected.value) {
    await fetchBalance()
  }
})

const canUpload = computed(() => user.value?.beta_features !== undefined && user.value?.beta_features.includes('upload'))
</script>
