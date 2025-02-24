<template>
  <app-page>
    <template #body>

      <ClientOnly>
        <v-window v-model="window" show-arrows>
          <template #prev="{ props }">
            <v-btn variant="text" color="white" icon="mdi-chevron-left" @click="props.onClick" />
          </template>

          <template #next="{ props }">
            <v-btn variant="text" color="white" icon="mdi-chevron-right" @click="props.onClick" />
          </template>

          <v-window-item v-for="(drop, index) in activeDrops" :key="index" :value="index">
            <v-card class="app__hero mx-md-4 rounded-xl d-flex align-center" variant="text">
              <v-row>
                <v-col cols="10" md="8" class="mx-auto">

                  <v-row>
                    <v-col cols="auto" xs="12">
                      <NuxtLink :to="`/preview/${drop.id}`" class="text-decoration-none text-white">
                        <NuxtImg class="rounded-xl" :src="drop.image" width="280" height="280" format="webp" />
                      </NuxtLink>
                    </v-col>
                    <v-col xs="12" class="my-auto">
                      <v-row>
                        <v-col class="text-h5 px-md-4">
                          <NuxtLink :to="`/preview/${drop.id}`" class="text-decoration-none text-white">
                            {{ drop.title }}<br><span class="text-surface-variant text-body-1">{{ drop.subtitle
                              }}</span>
                          </NuxtLink>
                        </v-col>
                      </v-row>


                      <v-row>
                        <v-col cols="12" md="10" class="text-h4 px-md-4 py-3">
                          <ClientOnly>
                            <vue-countdown v-slot="{ days, hours, minutes, seconds }" class="px-md-2"
                              :time="remainingTime(drop.startTime)">
                              {{ days }}d {{ hours }}h {{ minutes }}m {{ seconds }}s
                            </vue-countdown>
                          </ClientOnly>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12" md="10" class="pb-0">
                          <v-btn block size="large" @click.stop="navigateTo(`/preview/${drop.id}`)">Preview</v-btn>
                        </v-col>
                        <v-col cols="12" md="10">
                          <AppDropNotificationBtn size="large" class="mt-3" :drop-id="drop.id" :title="drop.title"
                            :subtitle="drop.subtitle"
                            :image="img(drop.image, { width: 230, height: 230, fit: 'cover' })"
                            :start-time="drop.startTime" />
                        </v-col>
                      </v-row>

                    </v-col>
                  </v-row>

                </v-col>
              </v-row>

            </v-card>
          </v-window-item>

          <v-window-item :key="activeDrops.length" :value="activeDrops.length">
            <AppNftHero class="nft-hero mt-8"
              :image="useIpfsLink('ipfs://QmbGwgtpRFX3XiU2ppFEDnwyCzcfYTNBVsuxcxMMwGpP4t')!"
              title="BitSong NFT Genesis Collection"
              description="Dive into the Exclusive Realm of BitSong with Our Genesis NFT Collection! This collection is more than digital art – it's your VIP pass to BitSong's vibrant ecosystem"
              contract-address="bitsong1yw4xvtc43me9scqfr2jr2gzvcxd3a9y4eq7gaukreugw2yd2f8ts0wu96q" />

          </v-window-item>
        </v-window>

      </ClientOnly>


      <AppUpcomingDrops class="my-8" />

      <AppFeaturedDrops class="my-8" />

      <AppTopTraders class="my-8" />

      <AppTopReferrals class="my-8" />

      <v-container v-if="pending" fluid class="pb-0">
        <v-row>
          <v-col>
            <v-skeleton-loader class="py-2"
              type="heading, avatar, avatar, avatar, avatar, avatar, avatar, avatar, avatar" />
          </v-col>
        </v-row>
      </v-container>

      <AppSwiper v-else title="Users" :chip-text="data?.total" :items="users as SwiperItem[]" class="my-8" />
    </template>
  </app-page>
</template>

<script setup lang="ts">
import VueCountdown from '@chenfengyuan/vue-countdown';
import type { SwiperItem } from '~/components/app/AppSwiper.vue';
import ogImage from "@/assets/images/og-default-1200.png";

const img = useImage()

const window = ref(0)

interface LatestUser {
  address: string;
  username?: string;
  avatar?: string;
}

const activeDrops = getUpcomingDrops();

function remainingTime(startTime: number) {
  return (startTime - Math.floor(Date.now() / 1000)) * 1000
}

const { data, pending, execute } = useAsyncData(async () => {
  const users = await $fetch(`/api/latest/users`)

  return {
    total: users.total.toString(),
    users: users.users as LatestUser[],
  }
}, { immediate: false })

const users = computed(() => {
  return data.value?.users.map((user) => ({
    variant: "profile",
    title: user.username || formatShortAddress(user.address, 8),
    titleLink: `/u/${user.address}`,
    image: user.avatar ? useIpfsLink(user.avatar)! : '/images/default.png'
  }))
})

useSeoMeta({
  title: "BitSong Studio the Home of Web3 Music",
  ogImage,
  description: "BitSong Studio is a decentralized platform that allows music artists and fans to interact with each other in a fair and transparent way.",
})

onMounted(() => {
  execute()
})
</script>

<style>
.nft-hero>img.v-img__img {
  filter: brightness(0.4);
}
</style>