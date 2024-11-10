import { Injectable } from '@nestjs/common';
import questions from '../src/questionnaires/questions.json';
import { Question, SubQuestion } from '../src/common/types';

@Injectable()
export class AppService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getHello(): string {
    return 'Welcome to ARS Service.';
  }

  getQuestions() {
    const filteredQuestions = questions.questions.reduce(
      (acc: Question[], question: Question) => {
        if (question.active) {
          const activeQuestions = (question.questions as SubQuestion[]).filter(
            (q) => q.active,
          );
          if (activeQuestions.length) {
            acc.push({ ...question, questions: activeQuestions });
          }
        }
        return acc;
      },
      [],
    );

    // return only needed fields
    return filteredQuestions.map((question) => {
      return {
        id: question.id,
        questions: question.questions.map((q: any) => {
          return {
            number: q.number,
            question: q.question,
            options: q.options,
            responseType: q.responseType,
            inputType: q.inputType,
            hideConditions: q.hideConditions,
          };
        }),
        category: question.category,
        hideConditions: question.hideConditions,
      };
    });
  }
}
