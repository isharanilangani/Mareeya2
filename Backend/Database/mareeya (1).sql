-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 21, 2024 at 11:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mareeya`
--

-- --------------------------------------------------------

--
-- Table structure for table `driverby`
--

CREATE TABLE `driverby` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `driverby`
--

INSERT INTO `driverby` (`id`, `vehicle_id`, `driver_id`) VALUES
(67, 47, 59),
(69, 47, 45),
(70, 48, 51),
(71, 48, 58),
(72, 48, 57),
(73, 48, 50),
(74, 47, 53),
(75, 48, 53),
(76, 47, 56),
(77, 48, 56);

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `name` varchar(225) NOT NULL,
  `contact` varchar(10) NOT NULL DEFAULT 'None',
  `license_number` varchar(60) NOT NULL DEFAULT 'None',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `name`, `contact`, `license_number`, `created_date`) VALUES
(45, 'Ishara Dabarer', '077565656', '5998', '2024-12-21 09:55:03'),
(50, 'deshani', '265959', '154868', '2024-12-21 09:56:19'),
(51, 'harshani', '496', '15486', '2024-12-21 09:55:52'),
(53, 'rosi', '56566', '6595959', '2024-12-21 09:56:27'),
(56, 'nilupul', '849879', '2156489498', '2024-12-21 09:56:34'),
(57, 'Rshami', '445456863', '46546', '2024-12-21 09:56:03'),
(58, 'kevin', '5656656', '56686', '2024-12-21 09:55:58'),
(59, 'nimal', '65986', '4868', '2024-12-21 09:54:05');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `expense_id` int(11) NOT NULL,
  `payment_date` varchar(50) NOT NULL,
  `description` varchar(225) NOT NULL,
  `amount` int(11) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `vehicle_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `payment_date` varchar(50) NOT NULL,
  `amount` varchar(100) NOT NULL,
  `purpose` varchar(225) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `driver_id`, `payment_date`, `amount`, `purpose`, `created_date`) VALUES
(21, 45, '2024-12-01', '3000', 'test', '2024-12-17 08:16:31'),
(24, 45, '2024-12-02', '45', 'foof', '2024-12-18 08:01:19'),
(25, 45, '2024-12-11', '7000', 'test', '2024-12-20 00:18:08'),
(26, 45, '2024-12-23', '8000', 'test', '2024-12-20 00:18:23'),
(27, 45, '2024-12-09', '50', 'fjkjfk', '2024-12-20 00:18:43');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `pk_id` int(5) NOT NULL,
  `username` varchar(20) DEFAULT NULL,
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password` varchar(225) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`pk_id`, `username`, `updated_date`, `password`) VALUES
(15, 'testuser', '2024-12-21 09:48:51', '$2b$10$wgufmxo4MLrRlMz8hLHn5.BkcGureSkVRCHLS5udWjm09yuOsYdpK');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `type` varchar(60) NOT NULL DEFAULT 'None',
  `brand` varchar(60) NOT NULL DEFAULT 'None',
  `purchase_date` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'None',
  `created_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `vehicle_number`, `type`, `brand`, `purchase_date`, `status`, `created_date`) VALUES
(47, '25-499', 'Car', 'BMW', '2024-12-12', 'Active', '2024-12-21 09:53:51'),
(48, 'ABC1235', 'Bike', 'Scooty', '2024-12-05', 'Active', '2024-12-21 09:55:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `driverby`
--
ALTER TABLE `driverby`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle` (`vehicle_id`),
  ADD KEY `driver` (`driver_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`expense_id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`pk_id`),
  ADD UNIQUE KEY `Username` (`username`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `vehicle_number` (`vehicle_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `driverby`
--
ALTER TABLE `driverby`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `expense_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `pk_id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `driverby`
--
ALTER TABLE `driverby`
  ADD CONSTRAINT `driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`),
  ADD CONSTRAINT `vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`);

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `driver_id` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
