import { PraiseDto, QuantificationDto } from 'types/dist/praise';

export const findPraiseQuantification = (
  praise: PraiseDto,
  userId: string
): QuantificationDto | undefined => {
  return praise.quantifications.find((q) => q.quantifier === userId);
};

export const shortenDuplicatePraiseId = (
  praise: PraiseDto,
  userId: string
): string => {
  const q = findPraiseQuantification(praise, userId);
  return q && q.duplicatePraise ? q.duplicatePraise?.slice(-4) : '';
};
