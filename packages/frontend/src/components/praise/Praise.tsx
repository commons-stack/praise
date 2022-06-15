import { PraiseDto } from 'api/dist/praise/types';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import { InlineLabel } from '@/components/InlineLabel';
import { classNames } from '@/utils/index';
import {
  localizeAndFormatIsoDate,
  localizeAndFormatIsoDateRelative,
  DATE_FORMAT_LONG_NAME,
} from '@/utils/date';
import { Tooltip } from '@mui/material';
import ResetQuantificationButton from './ResetQuantificationButton';

interface Props {
  praise: PraiseDto;
  showIdPrefix?: boolean;
  showReceiver?: boolean;
  periodId?: string;
  usePseudonyms?: boolean;
  className?: string;
  dismissed?: boolean;
  shortDuplicatePraiseId?: string;
}

const Praise = ({
  praise,
  showIdPrefix = false,
  showReceiver = true,
  periodId = undefined,
  usePseudonyms = false,
  className = '',
  dismissed = false,
  shortDuplicatePraiseId = undefined,
}: Props): JSX.Element | null => {
  if (!praise) return null;

  if (usePseudonyms && !periodId) return null;

  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex items-center">
        <UserAvatar userAccount={praise.giver} usePseudonym={usePseudonyms} />
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <ForwarderTooltip praise={praise} />
          <span className="font-bold">
            {usePseudonyms && periodId ? (
              <UserPseudonym userId={praise.giver._id} periodId={periodId} />
            ) : (
              praise.giver.name
            )}
          </span>
          {showReceiver && (
            <span>
              {' '}
              to <span className="font-bold">{praise.receiver.name}</span>
            </span>
          )}
          <Tooltip
            placement="right-end"
            title={localizeAndFormatIsoDate(
              praise.createdAt,
              DATE_FORMAT_LONG_NAME
            )}
            arrow
          >
            <span className="ml-2 text-xs text-gray-500 dark:text-white/50">
              {localizeAndFormatIsoDateRelative(praise.createdAt)}
            </span>
          </Tooltip>
        </div>

        <div className="w-full">
          {showIdPrefix && (
            <InlineLabel
              text={`#${praise._id.slice(-4)}`}
              className="bg-gray-400"
            />
          )}
          {dismissed && (
            <InlineLabel
              text="Dismissed"
              button={<ResetQuantificationButton praise={praise} />}
              className="bg-red-600"
            />
          )}
          {shortDuplicatePraiseId && (
            <InlineLabel
              text={`Duplicate of: #${shortDuplicatePraiseId}`}
              button={<ResetQuantificationButton praise={praise} />}
            />
          )}
          <span
            dangerouslySetInnerHTML={{
              __html: getMarkdownText(praise.reasonRealized),
            }}
            className={classNames(
              dismissed ? 'line-through' : '',
              shortDuplicatePraiseId ? 'text-gray-400' : ''
            )}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default Praise;
