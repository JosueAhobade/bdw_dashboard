<template>
  <OperationsPage :config="config" />
</template>

<script setup>
import OperationsPage from "@/components/operations/OperationsPage.vue";

const config = {
  kind: "depenses",
  title: "Suivi des dépenses",
  singular: "dépense",
  plural: "dépense(s)",
  refPrefix: "#FAC-",
  typeField: "type_depense",
  typeLabel: "Type de dépense",
  typePlaceholder: "achat, abonnement, salaire...",
  dateField: "date_depense",
  showEmploye: true,
};
</script>
