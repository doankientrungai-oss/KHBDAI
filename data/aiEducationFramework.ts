import { AICodeItem, AIGradeFramework, primaryGradeData } from './aiGrades/primary';
import { lowerSecondaryGradeData } from './aiGrades/lowerSecondary';
import { upperSecondaryGradeData } from './aiGrades/upperSecondary';

export type { AICodeItem, AIGradeFramework };

export const AI_EDUCATION_DOMAINS = [
  {
    id: 'NLa',
    code: 'A',
    name: 'Tư duy lấy con người làm trung tâm',
    topics: [
      { id: 'A1', name: 'Tính chủ động của con người' },
      { id: 'A2', name: 'AI vì sự tiến bộ của con người' },
      { id: 'A3', name: 'Công dân trong kỉ nguyên AI' }
    ]
  },
  {
    id: 'NLb',
    code: 'B',
    name: 'Đạo đức AI',
    topics: [
      { id: 'B1', name: 'Các khía cạnh đạo đức của AI' },
      { id: 'B2', name: 'Sử dụng AI an toàn và có trách nhiệm' },
      { id: 'B3', name: 'Nguyên tắc đạo đức và trách nhiệm xã hội' }
    ]
  },
  {
    id: 'NLc',
    code: 'C',
    name: 'Các kĩ thuật và ứng dụng AI',
    topics: [
      { id: 'C1', name: 'Đặc điểm chính của AI' },
      { id: 'C2', name: 'Ứng dụng AI trong học tập và cuộc sống' },
      { id: 'C3', name: 'Công nghệ AI' },
      { id: 'C4', name: 'Dữ liệu trong AI' },
      { id: 'C5', name: 'Kĩ thuật và thuật toán AI' }
    ]
  },
  {
    id: 'NLd',
    code: 'D',
    name: 'Thiết kế hệ thống AI',
    topics: [
      { id: 'D1', name: 'Nhận diện và hình thành giải pháp' },
      { id: 'D2', name: 'Cấu trúc và tương tác, cải tiến hệ thống' }
    ]
  }
];

export const AI_FRAMEWORK_BY_GRADE: Record<string, AIGradeFramework> = {
  ...primaryGradeData,
  ...lowerSecondaryGradeData,
  ...upperSecondaryGradeData
};
