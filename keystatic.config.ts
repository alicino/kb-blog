import { collection, config, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: { name: 'alicino/knowledge base' },
    navigation: {
      Conteúdo: ['posts'],
    },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      entryLayout: 'content',
      columns: ['title', 'publishedAt', 'category', 'draft'],
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({
          name: { label: 'Título' },
        }),
        description: fields.text({
          label: 'Descrição',
          multiline: true,
          validation: { isRequired: true },
        }),
        publishedAt: fields.date({
          label: 'Data de publicação',
          validation: { isRequired: true },
        }),
        category: fields.text({
          label: 'Categoria',
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'Nova tag',
        }),
        draft: fields.checkbox({
          label: 'Rascunho',
          description: 'Posts marcados como rascunho não aparecem no blog.',
          defaultValue: true,
        }),
        content: fields.markdoc({
          label: 'Conteúdo',
          extension: 'md',
        }),
      },
    }),
  },
});
