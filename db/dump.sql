BEGIN TRANSACTION;
CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      math INTEGER,
      english INTEGER,
      science INTEGER
    );
INSERT INTO users VALUES(5,'Wednesday Holmes','Grade 5',54,45,76);
INSERT INTO users VALUES(6,'Chapi Joyce','Grade 8',24,87,43);
INSERT INTO users VALUES(8,'Richard Nixon','Grade 5',74,68,53);
INSERT INTO users VALUES(9,'Jane Smith','Grade 5',80,80,80);
INSERT INTO users VALUES(10,'Gracious Ene','Grade 5',78,84,65);
INSERT INTO users VALUES(11,'Daniel Okafor','Grade 1',65,98,76);
INSERT INTO users VALUES(12,'Aisha Bello','Grade 1',87,65,67);
INSERT INTO users VALUES(13,'Michael Adeyemi','Grade 1',76,67,98);
INSERT INTO users VALUES(14,'Chiamaka Nwosu','Grade 1',87,67,98);
INSERT INTO users VALUES(16,'Tunde Balogun','Grade 2',100,56,85);
INSERT INTO users VALUES(17,'Zainab Abdullahi','Grade 2',73,57,95);
INSERT INTO users VALUES(18,'Emeka Obi','Grade 2',72,92,64);
INSERT INTO users VALUES(19,'Fatima Sani','Grade 3',77,47,63);
INSERT INTO users VALUES(20,'Grace Ojo','Grade 3',74,44,65);
INSERT INTO users VALUES(21,'Samuel Yakubu','Grade 4',65,57,76);
INSERT INTO users VALUES(22,'Blessing Uche','Grade 3',65,87,65);
INSERT INTO users VALUES(23,'Musa Garba','Grade 4',64,56,74);
INSERT INTO users VALUES(24,'Esther Oladipo','Grade 4',78,99,65);
INSERT INTO users VALUES(25,'Victor Chukwu','Grade 4',65,98,65);
INSERT INTO users VALUES(26,'Hadiza Lawal','Grade 4',37,49,65);
INSERT INTO users VALUES(27,'David Adebayo','Grade 6',99,89,86);
INSERT INTO users VALUES(28,'Ifeoma Okeke','Grade 6',96,78,82);
INSERT INTO users VALUES(29,'Ahmed Suleiman','Grade 6',77,56,69);
INSERT INTO users VALUES(30,'Ruth Nnamdi','Grade 6',96,86,75);
INSERT INTO users VALUES(31,'Sadiq Mohammed','Grade 7',65,76,75);
INSERT INTO users VALUES(32,'Deborah Ajayi','Grade 7',73,62,97);
INSERT INTO users VALUES(33,'Paul Ibe','Grade 8',55,47,64);
INSERT INTO users VALUES(34,'Ethan Carter','Grade 8',76,98,87);
INSERT INTO users VALUES(35,'Olivia Bennett','Grade 8',82,97,80);
INSERT INTO users VALUES(36,'Liam Anderson','Grade 8',35,64,55);
INSERT INTO users VALUES(37,'Sophia Mitchell','Grade 8',72,77,65);
INSERT INTO users VALUES(38,'Sophia Mitchell','Grade 9',66,56,45);
INSERT INTO users VALUES(39,'Ava Richardson','Grade 9',73,86,77);
INSERT INTO users VALUES(40,'Mason Brooks','Grade 9',88,89,93);
INSERT INTO users VALUES(41,'Isabella Cooper','Grade 10',65,78,75);
INSERT INTO users VALUES(42,'Lucas Hayes','Grade 10',66,74,80);
INSERT INTO users VALUES(43,'Mia Peterson','Grade 10',89,84,91);
INSERT INTO users VALUES(44,'Elijah Simmons','Grade 10',68,71,60);
INSERT INTO users VALUES(45,'Harper Collins','Grade 10',35,54,61);
INSERT INTO users VALUES(46,'James Foster','Grade 10',71,77,75);
INSERT INTO users VALUES(47,'Amelia Reed','Grade 11',88,81,91);
INSERT INTO users VALUES(48,'Benjamin Hughes','Grade 11',72,64,77);
INSERT INTO users VALUES(49,'Charlotte Ward','Grade 11',64,72,67);
INSERT INTO users VALUES(50,'Henry Cox','Grade 11',85,88,93);
INSERT INTO users VALUES(51,'Evelyn Price','Grade 11',70,82,85);
INSERT INTO users VALUES(52,'Scarlett Turner','Grade 11',73,56,70);
INSERT INTO users VALUES(53,'Alexander Scott','Grade 11',91,83,97);
INSERT INTO users VALUES(54,'Chloe Bennett','Grade 12',56,78,45);
INSERT INTO users VALUES(55,'Matthew Kelly','Grade 12',87,94,85);
INSERT INTO users VALUES(56,'Lily Watson','Grade 12',65,78,75);
CREATE TABLE staff (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
INSERT INTO staff VALUES(8,'Isaac Ime','admin@example.com','$2b$10$f1ky/FPVN/6sLf49NVjwD./zX5zL6QC8uhhc2TlLDHyMF3SCH42Jq','superadmin');
INSERT INTO staff VALUES(10,'Frank Ocean','ocean@frank.com','$2b$10$tf1BGrt0njuj3uU.RRDvH.iD7JzD.FqF4PRpurJzr.ConYpGBfAzO','admin');
INSERT INTO staff VALUES(11,'Green Dee','dee@green.com','$2b$10$ROficXsnN4KPeveTZ29EB.WhP/8dt1.zHVN.O.Tiy5Bu4KLELRRzi','admin');
INSERT INTO staff VALUES(12,'Travis Scott','scott@travis.com','$2b$10$vfFopCmwbueIHbR7dWJrKeV.jvBg4BCfXh3OeA.ajmcJe5GDx/Hz.','admin');
INSERT INTO staff VALUES(13,'Enobong Ime','enobong@example.com','$2b$10$/bB62tedV/XXZYKaADWECuuNwVFM08SuT29.zsdkF1bWF9Sv2R86a','teacher');
INSERT INTO staff VALUES(16,'Vanilla Ice','johhny@fresh.com','$2b$10$9lrti.Pd/txk0Ai/R4RMLOr6.sfxyM9UWkSnw4HOp6ei8wm0d0Fs2','teacher');
INSERT INTO staff VALUES(19,'Grace Jones','jones@gmail.com','$2b$10$Wra4Z2zjzzZKMcqGqqwmt.pjeZ7/YtQ4JjlFWDG5bUCHJBcXr6YD6','teacher');
INSERT INTO staff VALUES(20,'John Doe','doe@gmail.com','$2b$10$CxsU8r7fm1N1/.Ee4DtaluZ6OKmRelsEYRQ2BN69yq4hoz9b03loW','teacher');
INSERT INTO staff VALUES(21,'Gregory Well','gregwells@gmail.com','$2b$10$7rTTRGO13nBrADgpF9wVY.mOEMhGPcC7YDKyfuLts95OKAOomn0Le','teacher');
INSERT INTO staff VALUES(22,'Isaac Ime','enobongime79@gmail.com','$2b$10$QjETfVU6xSAxcXC/IHKbC.s6uK2hxTcyKQtE..OtOdRxNcwmGEBb2','teacher');
INSERT INTO staff VALUES(23,'Kelechi Nnamani','kele@example.com','$2b$10$/OqKZLrINESIPx3OTCPjQO121rKx2mQM4Nj8rylyXPf5RqNSW6Dsy','teacher');
INSERT INTO staff VALUES(24,'Sadiya Usman','diya@example.com','$2b$10$gLpR.2T4ZT0rAD347ImGbucsk1PBd0o5W2qtmiGpxJzeOsQacD216','teacher');
INSERT INTO staff VALUES(25,'Oluwaseun Ogunleye','seun@example.com','$2b$10$HvhlAQWnxjXqPXd6WPzWgeB9wMIT28y4eMmvaOqgf45NjpivswmpG','teacher');
INSERT INTO staff VALUES(26,'Chidera Ekwueme','dera@example.com','$2b$10$xsY52hWQuBQ.30j8wu/bnOvpHbDu3hsvVNIWUqO8hW3OxaVBvFrPO','teacher');
INSERT INTO staff VALUES(27,'Hamza Danjuma','hamza@example.com','$2b$10$.crUcvx2AODdLGnEBw2preG2IQEsvQ6t7F6PUUvqlTpzs/Y/ska4W','teacher');
INSERT INTO staff VALUES(28,'Amaka Onyekachi','maka@example.com','$2b$10$h9LjP/HXFqn3PSrxqiQUP.LvHur9MeoXpLQ8prqyoqPqwSwooyB9u','teacher');
INSERT INTO staff VALUES(29,'Idris Bello','bello@gmail.com','$2b$10$wzkNX4LkZta//j7d6ilZU.2gkYGYvohOOLKZqZY7v48os5g4brSkS','teacher');
CREATE TABLE admins (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      admin_id INTEGER,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    );
INSERT INTO admins VALUES(5,'French Bulldog',7);
INSERT INTO admins VALUES(7,'Frank Ocean',10);
INSERT INTO admins VALUES(8,'Green Dee',11);
INSERT INTO admins VALUES(9,'Travis Scott',12);
CREATE TABLE teachers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      teacher_id INTEGER,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    );
INSERT INTO teachers VALUES(2,'Vanilla Ice','12',16);
INSERT INTO teachers VALUES(5,'Grace Jones','10',19);
INSERT INTO teachers VALUES(6,'John Doe','11',20);
INSERT INTO teachers VALUES(7,'Gregory Well','5',21);
INSERT INTO teachers VALUES(8,'Isaac Ime','1',22);
INSERT INTO teachers VALUES(9,'Kelechi Nnamani','2',23);
INSERT INTO teachers VALUES(10,'Sadiya Usman','3',24);
INSERT INTO teachers VALUES(11,'Oluwaseun Ogunleye','4',25);
INSERT INTO teachers VALUES(12,'Chidera Ekwueme','7',26);
INSERT INTO teachers VALUES(13,'Hamza Danjuma','6',27);
INSERT INTO teachers VALUES(14,'Amaka Onyekachi','8',28);
INSERT INTO teachers VALUES(15,'Idris Bello','9',29);
