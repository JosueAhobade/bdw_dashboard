<template>
  <OperationsPage :config="config" />
</template>

<script setup>
import OperationsPage from "@/components/operations/OperationsPage.vue";

const config = {
  kind: "recettes",
  title: "Suivi des recettes",
  singular: "recette",
  plural: "recette(s)",
  refPrefix: "#FAC-",
  typeField: "type_recette",
  typeLabel: "Type de recette",
  typePlaceholder: "vente, service, formation...",
  dateField: "date_recette",
  showEmploye: false,
};
</script>
