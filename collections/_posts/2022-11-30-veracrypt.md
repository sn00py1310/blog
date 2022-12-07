---
author: sn00py1310
title: VeraCrypt - How to block the Windows format drive popup
tag: veracrypt
---

## The story
VeraCrypt is a good software, but it there is one downside. If you have an encrypted partition you get a annoying popup on Windows: "Format the Disk before You Can Use It". This was getting really annoying to me so I spend a lot of time reading through [Google](https://www.google.com/search?q=veracrypt+Format+the+Disk+before+You+Can+Use+It) and finding a loot of partial solutions. All of them where only for the current PC, but I want something which worked on every PC and now we are here.

## How to fix
**Warning: Before you take any steps make sure you have backups of the data on the drives. All of your data is going to get wiped!**

Lets pretend you have a external drive with 69 GB of space. Then you roughly need to do these steps.

Start [diskpart](https://wikipedia.org/wiki/Diskpart) (in CMD or PowerShell use the command `diskpart`).

Check if the drive is in GPT mode.
```
DISKPART> list disk

  Disk ###  Status         Size     Free     Dyn  GPT
  --------  -------------  -------  -------  ---  ---
  Disk 0    Online          000 GB      0 B        *
  Disk 1    Online           69 GB      0 B        
```

If not convert the disk to GPT.
```
list disk
select disk X

convert gpt
```

Create a partition with your favorite tool. Encrypt the partition with VeraCrypt partition/drive encryption (non-system).

Remove the drive letter from the auto mounted volume which Windows doesn't recognize.
```
list volume
select volume X
remove
```

Change the GPT [attributes](https://superuser.com/a/1469951) to hidden and change the partition type ([en](https://en.wikipedia.org/wiki/GUID_Partition_Table), [de](https://de.wikipedia.org/wiki/GUID_Partition_Table#Partitionstyp-GUIDs)) to FAT.

```
list disk
select disk X

list part
select part X

detail part
gpt attributes=0x4000000000000000
set id=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7

detail part
```
Now check if the changes have been written to the partition.