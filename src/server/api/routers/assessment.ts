import { formSchema } from "~/app/_components/form/formDefinitions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const assessmentRouter = createTRPCRouter({
  create: publicProcedure.input(formSchema).mutation(async ({ input }) => {
    // Here you would typically save to database and/or process the assessment
    // For now, we'll return mock recommendations
    const recommendations = `Mock recommendations 
    ${JSON.stringify(input, null, 2)}`;

    return {
      success: true,
      data: {
        recommendations,
      },
    };
  }),
});
