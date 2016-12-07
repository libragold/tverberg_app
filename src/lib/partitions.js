function triplize(list) {
  const n = list.length;
  if (n === 0) return [[]];
  if (n <= 3) return [[list]];
  const partitions = [];
  for (let t2 = 0; t2 < n-1; t2 += 1) {
    for (let t3 = 0; t3 < n-2; t3 += 1) {
      const clone = list.slice();
      const t = [clone.splice(0, 1)[0], clone.splice(t2, 1)[0], clone.splice(t3, 1)[0]];
      for (const triplization of triplize(clone)) {
        partitions.push([t, ...triplization]);
      }
    }
  }
  return partitions;
}

export default function (n) {
  // n = 3r - 2
  // it partitions the [0,1,2,...,n-1] into 1 + 3 + 3 + 3 + ... or 2 + 2 + 3 + 3 + ...
  const partitions = [];
  for (let x = 0; x < n; x += 1) {
    const list = [...Array(n).keys()];
    const a = list.splice(x, 1);
    for (const triplization of triplize(list)) {
      partitions.push([a, ...triplization]);
    }
  }
  if (n < 4) return partitions;
  for (let x1 = 0; x1 < n; x1 += 1) {
    for (let x2 = x1; x2 < n-1; x2 += 1) {
      for (let x3 = x2; x3 < n-2; x3 += 1) {
        for (let x4 = x3; x4 < n-3; x4 += 1) {
          const list = [...Array(n).keys()];
          const a = [
            list.splice(x1, 1)[0],
            list.splice(x2, 1)[0],
            list.splice(x3, 1)[0],
            list.splice(x4, 1)[0],
          ];
          for (const triplization of triplize(list)) {
            partitions.push([[a[0], a[1]], [a[2], a[3]], ...triplization]);
            partitions.push([[a[0], a[2]], [a[1], a[3]], ...triplization]);
            partitions.push([[a[0], a[3]], [a[1], a[2]], ...triplization]);
          }
        }
      }
    }
  }
  return partitions;
}
