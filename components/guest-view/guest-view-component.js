import React from 'react';
import PropTypes from 'prop-types';

import { StyledCardList, StyledCardListItem } from '../card-list';
import cards from '../../constants/cards';

const GuestView = ({
  className,
  room, vote,
  votedValue,
  sessionStarted,
}) => (
  <div className={`component-guest-view ${className}`}>
    {sessionStarted ? (
      <StyledCardList>
        {cards[room.cardsMode].map((value) => (
          <div className="component-guest-view__card-wrap" key={value}>
            <StyledCardListItem
              selected={(votedValue && value) && votedValue === value}
              onClick={() => vote(value)}
            >
              <span>{value}</span>
            </StyledCardListItem>
          </div>
        ))}
      </StyledCardList>
    ) : (
      <p>Waiting for the host to start the session.</p>
    )}
  </div>
);

GuestView.propTypes = {
  className: PropTypes.string.isRequired,
  room: PropTypes.shape({
    name: PropTypes.string,
    cardsMode: PropTypes.string,
  }),
  vote: PropTypes.func.isRequired,
  votedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sessionStarted: PropTypes.bool.isRequired,
};

GuestView.defaultProps = {
  room: {},
  votedValue: null,
};

export default GuestView;
