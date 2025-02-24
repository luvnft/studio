<template>
  <div>
    <v-container class="mt-8">
      <v-row justify="center">
        <v-col cols="auto" class="text-center">
          <h1 class="text-h4 text-md-h3 font-weight-bold">Music NFT</h1>
          <h2 class="text-h6 pt-2 text-surface-variant">Complete the steps below to release on chain your Music NFT</h2>
        </v-col>
      </v-row>

      <v-row justify="center" class="mt-md-12 mt-2">
        <v-col cols="12" xl="2" lg="3">
          <v-card class="d-flex flex-column pa-4">
            <v-img cover gradient="to bottom, rgba(0,0,0,.10), rgba(0,0,0,.7)"
              :src="img(track!.artwork, { width: 250, height: 250, fit: 'cover' })" height="230" width="100%">
            </v-img>
            <v-card-subtitle :style="{ whiteSpace: 'normal', lineHeight: '1.4rem' }" class="px-0 mt-2">
              {{ formattedArtists || '-' }}
            </v-card-subtitle>
            <v-card-title class="px-0 mt-n1" :style="{ whiteSpace: 'normal' }">
              {{ track?.title || '-' }} {{ track?.version ? `(${track?.version})` : '' }}
            </v-card-title>
          </v-card>
        </v-col>

        <v-col cols="12" xl="4" lg="6">
          <v-row align="center">
            <v-col cols="8">
              <div class="text-h6">Publish track metadata</div>
              <div class="text-body-1 text-surface-variant">Publish your track metadata on chain</div>
            </v-col>
            <v-col>
              <v-btn v-if="metadataEnabled && !loading" variant="text" icon="mdi-chevron-right"
                @click.stop="publishMetadata"></v-btn>
              <v-icon v-if="metadataSuccess" color="green">mdi-check</v-icon>
              <v-progress-circular v-if="loading && metadataEnabled" width="3" indeterminate
                color="primary"></v-progress-circular>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="8">
              <div class="text-h6">Royalties Contract</div>
              <div class="text-body-1 text-surface-variant">Create the royalties contract on bitsong</div>
            </v-col>
            <v-col>
              <v-btn v-if="royaltiesEnabled && !loading" variant="text" icon="mdi-chevron-right"
                @click.stop="createRoyalties"></v-btn>
              <v-icon v-if="royaltiesSuccess" color="green">mdi-check</v-icon>
              <v-progress-circular v-if="loading && royaltiesEnabled" width="3" indeterminate
                color="primary"></v-progress-circular>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="8">
              <div class="text-h6">Music NFT</div>
              <div class="text-body-1 text-surface-variant">Create the music NFT on bitsong</div>
            </v-col>
            <v-col>
              <v-btn v-if="musicNftEnabled && !loading" variant="text" icon="mdi-chevron-right"
                @click.stop="createCurve"></v-btn>
              <v-icon v-if="musicNftSuccess" color="green">mdi-check</v-icon>
              <v-progress-circular v-if="loading && musicNftEnabled" width="3" indeterminate
                color="primary"></v-progress-circular>
            </v-col>
          </v-row>
          <v-row align="center" v-if="currentStep === 3">
            <v-col cols="8">
              <v-btn>View Music Nft</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { contracts } from "@bitsongjs/telescope";

const { Bs721FactoryClient } = contracts.Bs721Factory;

definePageMeta({
  layout: 'app-bar-only',
  middleware: ["upload"]
})

const trackId = useRoute().params.id as string

const currentStep = ref(0)

const { data: track, refresh } = await useFetch(`${useRuntimeConfig().public.mediaApiDirect}/tracks/${trackId}`, {
  immediate: true,
  headers: {
    'Authorization': `Bearer ${useUserState().value?.sid}`
  }
})

watch(track, (newVal) => {
  if (newVal?.artwork_ipfs_cid && newVal?.audio_ipfs_cid && newVal?.metadata_ipfs_cid) {
    currentStep.value = 1
  }

  if (newVal?.payment_address) {
    currentStep.value = 2
  }

  if (newVal?.status === 'Minted') {
    currentStep.value = 3
  }
}, {
  immediate: true
})

const img = useImage();
const formattedArtists = computed(() => track.value?.artists.map(artist => `${artist.name}`).join(", "));

const metadataEnabled = computed(() => {
  return currentStep.value === 0
})

const metadataSuccess = computed(() => {
  return currentStep.value > 0
})

const royaltiesEnabled = computed(() => {
  return currentStep.value === 1
})

const royaltiesSuccess = computed(() => {
  return currentStep.value > 1
})

const musicNftEnabled = computed(() => {
  return currentStep.value === 2
})

const musicNftSuccess = computed(() => {
  return currentStep.value > 2
})

const loading = ref(false)
const { success, error } = useNotify()

async function publishMetadata() {
  loading.value = true

  try {
    await $fetch(`${useRuntimeConfig().public.mediaApiDirect}/tracks/${trackId}/publish`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${useUserState().value?.sid}`
      }
    })

    await refresh()
    success("Metadata published")
    currentStep.value = 1
  } catch (e) {
    error((e as Error).message)
  } finally {
    loading.value = false
  }
}

async function createRoyalties() {
  loading.value = true

  try {
    const address = getAddress("bitsong");
    const factoryAddress = "bitsong1wug8sewp6cedgkmrmvhl3lf3tulagm9hnvy8p0rppz9yjw0g4wtqy04vy2";

    const factoryClient = new Bs721FactoryClient(
      await useCWClient(),
      address,
      factoryAddress,
    );

    const msg = await $fetch(`${useRuntimeConfig().public.mediaApiDirect}/tracks/${trackId}/msgs/royalties`, {
      headers: {
        'Authorization': `Bearer ${useUserState().value?.sid}`
      }
    })
    const tx = await factoryClient.createRoyaltiesGroup(msg, "auto", "", []);

    await $fetch(`${useRuntimeConfig().public.mediaApiDirect}/tracks/${trackId}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${useUserState().value?.sid}`
      },
      body: {
        payment_address: toValue(tx.logs[0].events[1].attributes[0].value)
      }
    })

    // success("Transaction success")

    // txRoyalties.value = tx
    // royaltiesAddress.value = tx.logs[0].events[1].attributes[0].value

    await refresh()
    success("Transaction success")
    currentStep.value = 2
  } catch (e) {
    error((e as Error).message)
  } finally {
    loading.value = false
  }
}

async function createCurve() {
  loading.value = true

  try {
    const msg = await $fetch(`${useRuntimeConfig().public.mediaApiDirect}/tracks/${trackId}/msgs/curve`, {
      headers: {
        'Authorization': `Bearer ${useUserState().value?.sid}`
      }
    })

    const address = getAddress("bitsong");
    const factoryAddress = "bitsong1wug8sewp6cedgkmrmvhl3lf3tulagm9hnvy8p0rppz9yjw0g4wtqy04vy2";

    const factoryClient = new Bs721FactoryClient(
      await useCWClient(),
      address,
      factoryAddress,
    );

    const tx = await factoryClient.createCurve(msg, "auto", "", [{ amount: "500000000", denom: "ubtsg" }]);

    const nft_address = tx.logs[0].events[3].attributes[2].value

    await $fetch(`${useRuntimeConfig().public.mediaApiDirect}/tracks/${trackId}/confirm`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${useUserState().value?.sid}`
      },
      body: {
        nft_address
      }
    })

    await refresh()
    success("Transaction success")
    currentStep.value = 3
  } catch (e) {
    error((e as Error).message)
  } finally {
    loading.value = false
  }
}
</script>