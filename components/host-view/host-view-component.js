import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useSocket } from '../../context/socket';
import { StyledCardList, StyledCardListItem } from '../card-list';
import Button from '../button';

const HostView = ({
  className,
  room,
  guestsVoted,
  hostVoted,
  clearVotes,
  isHost,
  startSession,
  sessionStarted,
}) => {
  const [winnerVote, setWinnerVote] = useState(null);
  const socket = useSocket();
  const inviteLink = `${process.env.NEXT_PUBLIC_HOST}/join?id=${room.id}`;

  const guestVoted = useCallback((guestId) => {
    const { vote = null } = room.guests.find(({ id }) => id === guestId);
    return vote;
  }, [room.guests]);

  const onKickGuestOut = useCallback(({ id, name }) => {
    if (window.confirm(`"${name}" adlı kullanıcıyı atmak istediğine emin misin?`)) {
      socket.emit('kickGuestOut', { roomId: room.id, guestId: id });
    }
  }, [socket, room.id]);

  const allVoted = guestsVoted && hostVoted;

  useEffect(() => {
    // Toplam kullanıcı sayısını host dahil hesapla
    const totalUsers = room.guests.length + 1; // Host dahil

    if (allVoted && totalUsers > 2) {
      const voteCounts = {}; // Oyları saymak için bir nesne oluşturun
      // Host'un oyununu da saymak için başlangıç değeri 1 olarak ayarlayın
      let maxVote = room.host.vote || '1';
      let maxCount = 1;
      let allVotesAreDifferent = true; // Tüm oyların farklı olduğunu varsayalım

      // Tüm guest'lerin ve host'un oylarını sayın
      room.guests.forEach(({ vote }) => {
        if (vote) {
          if (voteCounts[vote]) {
            voteCounts[vote] += 1;
            // Eğer bu oy, şu ana kadar en çok kullanılan oy ise, maxVote ve maxCount güncellenir
            if (voteCounts[vote] > maxCount) {
              maxVote = vote;
              maxCount = voteCounts[vote];
            }
            // En azından bir oy bir başka oy ile aynı ise, tüm oylar farklı değil demektir
            if (voteCounts[vote] > 1) {
              allVotesAreDifferent = false;
            }
          } else {
            voteCounts[vote] = 1;
          }
        }
      });

      if (allVotesAreDifferent) {
        // Eğer tüm oylar birbirinden farklı ise, winnerVote'u istediğiniz mesaj ile ayarlayın
        setWinnerVote('Siz nasıl ekipsiniz :D');
      } else {
        // Tüm oylar farklı değilse, kazanan oyu winnerVote olarak ayarlayın
        setWinnerVote(maxVote);
      }
    } else {
      // 2 veya daha az oy verildiğinde winnerVote state'ini false yapın
      setWinnerVote(false);
    }
  }, [allVoted, room.host.vote, room.guests]);

  const handleClearVotes = () => {
    setWinnerVote(false);
    clearVotes();
  };

  return (
    <div className={`${className} component-host-view`}>
      {isHost && (
        <p>
          Selam
          {' '}
          {room.host.name}
          , yönetici sensin.
          <br />
          Ekip arkadaşlarını davet etmek için aşağıda ki bağlantıyı kullanabilirsin.
          <br />
          <p className="invite-link">{inviteLink}</p>
        </p>
      )}
      {winnerVote && (
        <div className="winner-vote">
          <h1>
            Kazanan Oy:
            {' '}
            {winnerVote}
          </h1>
        </div>
      )}
      <div className="component-host-view__cards">
        <StyledCardList>
          <div className="component-host-view__card-wrap">
            <StyledCardListItem
              disabled={!guestsVoted}
              revealed={allVoted}
              readOnly
            >
              <span>{room.host.vote ? room.host.vote : '?'}</span>
              {!hostVoted && <small>Herkes oy verene kadar bekleyin</small>}
            </StyledCardListItem>
            <span>{room.host.name}</span>
          </div>
          {room.guests.map(({ id, name, vote = '?' }) => (
            <div className="component-host-view__card-wrap" key={id}>
              <StyledCardListItem
                disabled={!sessionStarted || !guestVoted(id)}
                revealed={allVoted}
                readOnly
              >
                <span>{allVoted ? vote : '?'}</span>
              </StyledCardListItem>
              {isHost ? (
                <button
                  className="kick-guest-button"
                  onClick={() => onKickGuestOut({ id, name })}
                  type="button"
                >
                  +
                </button>
              ) : null}
              <span>{name}</span>
            </div>
          ))}
        </StyledCardList>
      </div>
      {(isHost && !sessionStarted && !!room.guests.length) && (
        <Button
          onClick={startSession}
          className="component-host-view__button component-host-view__button--start"
        >
          Start session
        </Button>
      )}
      {(allVoted && isHost) && (
        <Button
          onClick={handleClearVotes}
          className="component-host-view__button component-host-view__button-reset"
        >
          Clear votes
        </Button>
      )}
    </div>
  );
};

HostView.propTypes = {
  className: PropTypes.string.isRequired,
  room: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    guests: PropTypes.arrayOf(PropTypes.shape({})),
    host: PropTypes.shape({
      name: PropTypes.string,
      vote: PropTypes.string,
    }),
  }),
  isHost: PropTypes.bool.isRequired,
  guestsVoted: PropTypes.bool.isRequired,
  hostVoted: PropTypes.bool.isRequired,
  clearVotes: PropTypes.func.isRequired,
  startSession: PropTypes.func.isRequired,
  sessionStarted: PropTypes.bool.isRequired,
};

HostView.defaultProps = {
  room: {},
};

export default HostView;
