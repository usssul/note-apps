<template>
	<div class="flex h-full">
		<SideBar />
		<div class="flex-1 flex flex-col items-center justify-center bg-[#f5f5f5] p-20px">
			<router-view v-slot="{ Component }">
				<transition name="fade" mode="out-in">
				<component :is="Component" />
				</transition>
			</router-view>
		</div>
	</div>

</template>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
