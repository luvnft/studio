<template>
  <v-navigation-drawer id="navdrawer" v-model="drawer" color="black">
    <div class="d-flex pt-3 pb-1 pl-4">
      <div>
        <NuxtLink to="/">
          <app-logo/>
        </NuxtLink>
      </div>
      <div class="ml-3 text-h5 d-flex align-center mr-2">
        <NuxtLink to="/" class="text-decoration-none text-white">
          {{ appName }}
        </NuxtLink>
      </div>
      <div class="d-flex align-center">
        <v-chip color="primary" class="text-capitalize">{{ network }}</v-chip>
      </div>
    </div>

    <v-list nav>
      <div v-for="item in navItems" :key="item.to">
        <v-list-item v-if="(item.onlyAdmin && isAdmin) || !item.onlyAdmin" :exact="item.exact" :to="item.to"
          :prepend-icon="item.icon" rounded="lg">
          <v-list-item-title class="text-body-1">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>

    <template #append>
      <ClientOnly>
        <div class="d-flex flex-columns justify-center align-center">
          <a
v-for="social in socials" :key="social.href" :href="social.href" target="_blank"
            class="text-surface-variant drawer-icon">
            <font-awesome-icon :icon="social.icon"/>
          </a>
        </div>
      </ClientOnly>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const { network, appName } = useRuntimeConfig().public
const { drawer, navItems } = useNavigationDrawer();

const socials = [
{
  icon: ['fab', 'discord'],
  href: 'https://discord.gg/HZEuNMVB5D',
},
{
  icon: ['fab', 'twitter'],
  href: 'https://twitter.com/atl5d',
},
{
  icon: ['fab', 'instagram'],
  href: 'https://www.instagram.com/atlga5d'
},
]

const isAdmin = computed(() => {
const user = useUserState();
if (!user.value?.address) return false;

const admins = [
  "bitsong12ssglnfg24p4psm66hkurq4mnkc6fey9pwmzmk",
  "bitsong1h882ezq7dyewld6gfv2e06qymvjxnu842586h2",
  "bitsong1q49ntyz2wjurrm56ymm5hjnz60ya3x783c5m6e",
  "bitsong1f5ze3svwg8fgjuwwnr743j6fr9vtyr58nex7tu",
  "bitsong1yyjyrzuk6r3fcrjrxyumgy85ys8lr9kn6xzxcj"
];

return admins.includes(user.value.address);
})
</script>

<style>
.drawer-icon {
width: 20px;
height: 20px;
margin: 15px 10px 15px 10px;
}
</style>
