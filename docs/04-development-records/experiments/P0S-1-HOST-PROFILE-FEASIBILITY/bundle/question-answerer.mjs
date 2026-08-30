/** NOT_PRODUCTION local answerer for the P0.S-1 safe tool probe. */
export const name = 'p0s1-question-answerer'

export function apply(ctx) {
  ctx.on('user-questions/request', async request => ({
    answers: request.questions.map(question => ({
      id: question.id,
      selected: question.options?.length ? [question.options[0].label] : [],
      custom: question.options?.length ? undefined : 'P0S1_AUTO_ANSWER',
    })),
  }))
}

