import { PraiseDto } from 'api/dist/praise/types';
import { useHistory } from 'react-router-dom';

interface PraiseRowProps {
  praise: PraiseDto;
  children: JSX.Element;
}

const PraiseRow = ({ praise, children }: PraiseRowProps): JSX.Element => {
  const history = useHistory();

  const handleClick =
    (data: PraiseDto) => (event: React.MouseEvent<HTMLTableRowElement>) => {
      const element = event.target as HTMLElement;

      if (element.tagName !== 'A') {
        history.push(`/praise/${data._id}`);
      }
    };

  return (
    <div
      className="cursor-pointer px-5 hover:bg-gray-100 dark:hover:bg-slate-500"
      onClick={handleClick(praise)}
    >
      {children}
    </div>
  );
};

export default PraiseRow;
