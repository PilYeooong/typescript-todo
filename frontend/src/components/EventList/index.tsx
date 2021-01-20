import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import { IEvent } from '../../typings/db';
import fetcher from '../../utils/fetcher';
import Event from '../Event';
import EventForm from '../EventForm';
import { EventListContainer } from './styles';

interface IProps {
  date: string;
}

const EventList: React.FC<IProps> = ({ date }) => {
  const [isEventFormVisible, setIsEventFormVisible] = useState<boolean>(false);

  const { data: events, revalidate } = useSWR<IEvent[]>(
    `/event/?date=${date}`,
    fetcher
  );

  const onToggleEventModal = useCallback(() => {
    setIsEventFormVisible((prev) => !prev);
  }, []);

  return (
    <EventListContainer>
      <div className="header">{date}</div>
      <div className="content">
        {events?.length === 0 ? (
          <span>기록 된 일정이 없습니다.</span>
        ) : (
          events?.map((event) => <Event event={event} />)
        )}
      </div>
      <button onClick={onToggleEventModal}>+</button>
      {isEventFormVisible ? (
        <EventForm
          date={date}
          isEventFormVisible={isEventFormVisible}
          setIsEventFormVisible={setIsEventFormVisible}
        />
      ) : null}
    </EventListContainer>
  );
};

export default EventList;