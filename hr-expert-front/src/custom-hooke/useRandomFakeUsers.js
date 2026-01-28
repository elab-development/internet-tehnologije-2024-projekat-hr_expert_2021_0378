import { useState, useEffect } from 'react';

/**
 * Generates fake users with today’s date for birthdays.
 * @param {number} count Number of fake users to generate
 * @returns {Array<{ id: number, name: string, department: string, image_url: string, date: string }>}
 */
export function useRandomFakeUsers(count = 36) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2,'0')}.${String(
      today.getMonth()+1
    ).padStart(2,'0')}.${today.getFullYear()}`;

    const departments = [
      'Engineering','Marketing','Sales','R&D',
      'Finance','Human Resources','IT','Support'
    ];

    fetch(`https://randomuser.me/api/?results=${count}&nat=us&inc=name,picture`)
      .then(res => res.json())
      .then(data => {
        setUsers(
          data.results.map((u, i) => ({
            id: i,
            name: `${u.name.first} ${u.name.last}`,
            department: departments[Math.floor(Math.random()*departments.length)],
            image_url: u.picture.medium,
            date: dateStr
          }))
        );
      })
      .catch(console.error);
  }, [count]);

  return users;
}
